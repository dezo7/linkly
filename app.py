import os
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from models import db, User, Post, Follow, Comment, PostLike, CommentLike
from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, func

load_dotenv()

app = Flask(__name__)

app.config.update(
    DEBUG=True,
    ENV='development',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASEURI'),
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY')
)

db.init_app(app)
Migrate(app, db)
jwt = JWTManager(app)
cors = CORS(app, origins=["http://localhost:5173"])

# Autenticación y Registro de Usuarios
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        new_user = User(
            username=data['username'],
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            date_of_birth=data['dateOfBirth'],
            location=data.get('location')
        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity=new_user.id, expires_delta=timedelta(days=1))
        return jsonify({"message": "User registered successfully.", "access_token": access_token}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=4))
            user_info = {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "id": user.id,
                "username": user.username
            }
            return jsonify({"message": "Login successful", "access_token": access_token, "user": user_info}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/validate_token', methods=['POST'])
@jwt_required()
def validate_token():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    return jsonify({"valid": True, "user": {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }}), 200

# Gestión de Perfiles de Usuario
@app.route('/profile/<username>', methods=['GET'])
@jwt_required()
def get_user_profile(username):
    user = User.query.filter_by(username=username).first()
    if user:
        current_user_id = get_jwt_identity()
        posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
        followed_ids = set(follow.followed_id for follow in Follow.query.filter_by(follower_id=current_user_id).all())

        posts_data = [
            {
                "id": post.id,
                "content": post.content,
                "created_at": format_datetime(post.created_at),
                "user_id": post.user_id,
                "author_name": user.first_name,
                "author_lastname": user.last_name,
                "author_username": user.username,
                "likes_count": len(post.likes),
                "liked_by_me": any(like.user_id == current_user_id for like in post.likes),
                "comments_count": len(post.comments),
                "author_is_following": post.user_id in followed_ids
            } for post in posts
        ]

        followers = user.followers.count()
        following = user.following.count()
        is_following = any(follower.follower_id == current_user_id for follower in user.followers)

        return jsonify({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "location": user.location,
            "posts": posts_data,
            "followers": followers,
            "following": following,
            "is_following": is_following
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/<username>/followers', methods=['GET'])
@jwt_required()
def get_followers(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    followers = Follow.query.filter_by(followed_id=user.id).join(User, Follow.follower_id == User.id).all()
    followers_data = [{'username': follower.follower.username, 'name': f'{follower.follower.first_name} {follower.follower.last_name}'} for follower in followers]
    return jsonify(followers_data)

@app.route('/<username>/following', methods=['GET'])
@jwt_required()
def get_following(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    following = Follow.query.filter_by(follower_id=user.id).join(User, Follow.followed_id == User.id).all()
    following_data = [{'username': follow.followed.username, 'name': f'{follow.followed.first_name} {follow.followed.last_name}'} for follow in following]
    return jsonify(following_data)

# Gestión de Seguimiento
@app.route('/follow/<int:user_id>', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id == user_id:
        return jsonify({"error": "Cannot follow yourself"}), 400

    follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        new_follower_count = db.session.query(func.count(Follow.follower_id)).filter(Follow.followed_id == user_id).scalar()
        return jsonify({"message": "Unfollowed successfully", "newFollowerCount": new_follower_count}), 200
    else:
        new_follow = Follow(follower_id=current_user_id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        new_follower_count = db.session.query(func.count(Follow.follower_id)).filter(Follow.followed_id == user_id).scalar()
        return jsonify({"message": "Followed successfully", "newFollowerCount": new_follower_count}), 201

@app.route('/unfollow/<string:username>', methods=['POST'])
@jwt_required()
def unfollow_user(username):
    current_user_id = get_jwt_identity()
    user_to_unfollow = User.query.filter_by(username=username).first()

    if not user_to_unfollow:
        return jsonify({"error": "User not found"}), 404

    follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_to_unfollow.id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        return jsonify({"message": "Unfollowed successfully"}), 200
    else:
        return jsonify({"error": "You are not following this user"}), 400
    
@app.route('/remove_follower/<string:username>', methods=['POST'])
@jwt_required()
def remove_follower(username):
    current_user_id = get_jwt_identity()
    user_to_remove = User.query.filter_by(username=username).first()

    if not user_to_remove:
        return jsonify({"error": "User not found"}), 404

    follow = Follow.query.filter_by(follower_id=user_to_remove.id, followed_id=current_user_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        return jsonify({"message": "Removed follower successfully"}), 200
    else:
        return jsonify({"error": "This user is not following you"}), 400

# Gestión de Posts
@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_post = Post(
            content=data['content'],
            user_id=current_user_id
        )
        db.session.add(new_post)
        db.session.commit()
        return jsonify({"message": "Post created successfully.", "post_id": new_post.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    current_user_id = get_jwt_identity()
    posts = Post.query.options(
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.user)
    ).join(User, Post.user_id == User.id).filter(
        (Post.user_id == current_user_id) |
        (Post.user_id.in_(
            db.session.query(Follow.followed_id).filter(Follow.follower_id == current_user_id)
        ))
    ).order_by(Post.created_at.desc()).all()

    followed_ids = set(follow.followed_id for follow in Follow.query.filter_by(follower_id=current_user_id).all())

    result = [
        {
            "id": post.id,
            "content": post.content,
            "created_at": format_datetime(post.created_at),
            "user_id": post.user_id,
            "author_name": post.user.first_name,
            "author_lastname": post.user.last_name,
            "author_username": post.user.username,
            "likes_count": len(post.likes),
            "liked_by_me": any(like.user_id == current_user_id for like in post.likes),
            "comments_count": len(post.comments),
            "author_is_following": post.user_id in followed_ids
        }
        for post in posts
    ]
    return jsonify(result)

@app.route('/all_posts', methods=['GET'])
@jwt_required()
def get_all_posts():
    current_user_id = get_jwt_identity()
    posts = Post.query.options(
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.user)
    ).order_by(Post.created_at.desc()).all()

    followed_ids = set(follow.followed_id for follow in Follow.query.filter_by(follower_id=current_user_id).all())

    result = [
        {
            "id": post.id,
            "content": post.content,
            "created_at": format_datetime(post.created_at),
            "user_id": post.user_id,
            "author_name": post.user.first_name,
            "author_lastname": post.user.last_name,
            "author_username": post.user.username,
            "likes_count": len(post.likes),
            "liked_by_me": any(like.user_id == current_user_id for like in post.likes),
            "comments_count": len(post.comments),
            "author_is_following": post.user_id in followed_ids
        }
        for post in posts
    ]
    return jsonify(result)

@app.route('/<username>/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(username, post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.options(
        joinedload(Post.likes),
        joinedload(Post.comments).joinedload(Comment.user),
        joinedload(Post.comments).joinedload(Comment.likes)
    ).filter_by(id=post_id).first()

    if not post or post.user.username != username:
        return jsonify({"error": "Post not found"}), 404
    
    followed_ids = set(follow.followed_id for follow in Follow.query.filter_by(follower_id=current_user_id).all())
    sorted_comments = sorted(post.comments, key=lambda x: x.created_at)

    post_data = {
        "id": post.id,
        "content": post.content,
        "created_at": format_datetime(post.created_at),
        "user_id": post.user_id,
        "author_name": post.user.first_name,
        "author_lastname": post.user.last_name,
        "author_username": post.user.username,
        "likes_count": len(post.likes),
        "liked_by_me": any(like.user_id == current_user_id for like in post.likes),
        "comments": [
            {
                "comment_id": comment.id,
                "comment_content": comment.content,
                "comment_author_id": comment.user_id,
                "comment_author_name": comment.user.first_name,
                "comment_author_lastname": comment.user.last_name,
                "comment_author_username": comment.user.username,
                "comment_created_at": format_datetime(comment.created_at),
                "likes_count": len(comment.likes),
                "liked_by_me": any(like.user_id == current_user_id for like in comment.likes),
                "is_following": comment.user_id in followed_ids
            } for comment in sorted_comments
        ]
    }
    return jsonify(post_data)

@app.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id).first()

    if not post:
        return jsonify({"error": "Post not found"}), 404

    if post.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully"}), 200

# Gestión de Likes
@app.route('/posts/<int:post_id>/toggle_like', methods=['POST'])
@jwt_required()
def toggle_post_like(post_id):
    current_user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id).first()
    if not post:
        return jsonify({"error": "Post not found"}), 404

    like = PostLike.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()
        liked_by_me = False
    else:
        new_like = PostLike(user_id=current_user_id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        liked_by_me = True

    new_likes_count = PostLike.query.filter_by(post_id=post_id).count()
    return jsonify({"message": "Like updated successfully", "new_likes_count": new_likes_count, "liked_by_me": liked_by_me}), 200

@app.route('/comments/<int:comment_id>/toggle_like', methods=['POST'])
@jwt_required()
def toggle_comment_like(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.filter_by(id=comment_id).first()
    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    like = CommentLike.query.filter_by(user_id=current_user_id, comment_id=comment_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()
        liked_by_me = False
    else:
        new_like = CommentLike(user_id=current_user_id, comment_id=comment_id)
        db.session.add(new_like)
        db.session.commit()
        liked_by_me = True

    new_likes_count = CommentLike.query.filter_by(comment_id=comment_id).count()
    return jsonify({"message": "Like updated successfully", "new_likes_count": new_likes_count, "liked_by_me": liked_by_me}), 200

# Gestión de Comentarios
@app.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('content').strip():
        return jsonify({"error": "Content cannot be empty"}), 400

    comment = Comment(
        content=data['content'],
        user_id=current_user_id,
        post_id=post_id
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Comment added successfully", "comment_id": comment.id}), 201

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.filter_by(id=comment_id).first()

    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    post = Post.query.filter_by(id=comment.post_id).first()
    if post.user_id != current_user_id and comment.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted successfully"}), 200

# Funciones de Búsqueda
@app.route('/search_users', methods=['GET'])
def search_users():
    query = request.args.get('q', '')
    if query:
        words = query.split()
        if len(words) >= 2:
            first_last = ' '.join(words)
            last_first = ' '.join(words[::-1])
            users = User.query.filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    func.concat(User.first_name, ' ', User.last_name).ilike(f'%{first_last}%'),
                    func.concat(User.first_name, ' ', User.last_name).ilike(f'%{last_first}%'),
                    func.concat(User.last_name, ' ', User.first_name).ilike(f'%{first_last}%'),
                    func.concat(User.last_name, ' ', User.first_name).ilike(f'%{last_first}%')
                )
            ).all()
        else:
            users = User.query.filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    func.concat(User.first_name, ' ', User.last_name).ilike(f'%{query}%')
                )
            ).all()
        
        result = [{'username': user.username, 'name': f'{user.first_name} {user.last_name}'} for user in users]
        return jsonify(result)
    return jsonify([])

# Utilidades
def format_datetime(value):
    if not value:
        return {"relative": "", "absolute": ""}

    # Asegurar que value sea "aware"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    # Formato absoluto
    absolute_format = value.strftime("%d/%m/%Y %H:%M")

    now = datetime.now(tz=timezone.utc)
    diff = now - value
    seconds = diff.total_seconds()

    # Calcular los intervalos directamente en segundos
    minute = 60
    hour = minute * 60
    day = hour * 24
    week = day * 7
    month = day * 30
    year = day * 365

    # Formato relativo
    if seconds < minute:
        count = int(seconds)
        relative_format = f"{count} second" + ("s" if count != 1 else "")
    elif seconds < hour:
        count = int(seconds // minute)
        relative_format = f"{count} minute" + ("s" if count != 1 else "")
    elif seconds < day:
        count = int(seconds // hour)
        relative_format = f"{count} hour" + ("s" if count != 1 else "")
    elif seconds < week:
        count = int(seconds // day)
        relative_format = f"{count} day" + ("s" if count != 1 else "")
    elif seconds < week * 4:
        count = int(seconds // week)
        relative_format = f"{count} week" + ("s" if count != 1 else "")
    elif seconds < year:
        count = int(seconds // month)
        if count < 12:
            relative_format = f"{count} month" + ("s" if count != 1 else "")
        else:
            relative_format = "1 year"
    else:
        count = int(seconds // year)
        relative_format = f"{count} year" + ("s" if count != 1 else "")

    return {"relative": relative_format, "absolute": absolute_format}

# Ejecución del Servidor
if __name__ == '__main__':
    app.run()