import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Context } from '../store/appContext';
import CommentCard from '../components/CommentCard';
import '../styles/PostDetail.css'

function PostDetail() {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const { username, id } = useParams();
    const [post, setPost] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [commentContent, setCommentContent] = useState('');
    const menuRef = useRef(null);
    const menuContainerRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                (!menuContainerRef.current || !menuContainerRef.current.contains(event.target))) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showMenu]);

    useEffect(() => {
        fetchPostDetails();
    }, [id, store.token]);

    const fetchPostDetails = () => {
        fetch(`http://127.0.0.1:5000/${username}/posts/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setPost(data);
            })
            .catch(error => console.error('Error fetching post:', error));
    };

    const handleLike = () => {
        const url = `http://127.0.0.1:5000/posts/${id}/toggle_like`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setPost(prevPost => ({
                    ...prevPost,
                    likes_count: data.new_likes_count,
                    liked_by_me: data.liked_by_me
                }));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleSubmitComment = (event) => {
        event.preventDefault();
        if (commentContent.trim()) {
            fetch(`http://127.0.0.1:5000/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.token}`
                },
                body: JSON.stringify({ content: commentContent.trim() })
            })
                .then(response => response.json())
                .then(() => {
                    fetchPostDetails();
                    setCommentContent('');
                })
                .catch(error => console.error('Error:', error));
        }
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleDelete = () => {
        const url = `http://127.0.0.1:5000/posts/${id}`;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    navigate('/');
                } else {
                    console.error('Failed to delete the post');
                }
            })
            .catch(error => console.error('Error:', error));
    };

    const deleteComment = (commentId) => {
        setPost(prevPost => ({
            ...prevPost,
            comments: prevPost.comments.filter(comment => comment.comment_id !== commentId)
        }));
    };

    return (
        <>
            <div className='postdetail-title'>
                <div className='postdetail-title-title'>Post</div>
            </div>
            {post ? (
                <>
                    <div className='postdetail-item'>
                        <div className='postdetail-item-title'>
                            <div className='postdetail-item-title-left'>
                                <span className='postdetail-item-title-name'>
                                    <Link to={`/${post.author_username}`}>
                                        {post.author_name} {post.author_lastname}
                                    </Link>
                                </span>&nbsp;
                                <span className='postdetail-item-title-username'>
                                    <Link to={`/${post.author_username}`}>
                                        @{post.author_username}
                                    </Link>
                                </span>&nbsp;·&nbsp;
                                <span title={post.created_at.absolute}>
                                    <Link to={`/${post.author_username}/post/${post.id}`}>
                                        {post.created_at.relative}
                                    </Link>
                                </span>
                            </div>
                            <div className='postdetail-item-title-right'>
                                <span ref={menuRef} onClick={toggleMenu}>
                                    <i className='fa-solid fa-ellipsis'></i>
                                </span>
                                {showMenu && (
                                    <div className='postdetail-menu' ref={menuContainerRef}>
                                        <ul>
                                            {store.user.username !== post.author_username && (
                                                <li onClick={() => navigate(`/${post.author_username}`)}>
                                                    <i className='fa-solid fa-user'></i>
                                                    Profile
                                                </li>
                                            )}
                                            {store.user.username === post.author_username && (
                                                <li onClick={handleDelete}>
                                                    <i className='fa-solid fa-trash'></i>
                                                    Delete
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className='postdetail-item-content'>{post.content}</p>
                        <div className='postdetail-item-interactions'>
                            <span className='postdetail-item-interactions-likes' onClick={handleLike}>
                                <i className={post.liked_by_me ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>&nbsp;
                                {post.likes_count}
                            </span>
                            <span className='postdetail-item-interactions-comments'>
                                <i className='fa-regular fa-comment'></i>&nbsp;
                                {post.comments ? post.comments.length : 0}
                            </span>
                        </div>
                    </div>
                    <div className='newcomment'>
                        <form onSubmit={handleSubmitComment}>
                            <textarea
                                className='newcomment-input'
                                name="comment"
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                placeholder="Add a comment..."
                                rows="2"
                            />
                            <button className='newcomment-button' type="submit" disabled={!commentContent.trim()}>
                                Comment
                            </button>
                        </form>
                    </div>
                    {post.comments.map(comment => {
                        return <CommentCard key={comment.comment_id} comment={comment} onDelete={deleteComment} />;
                    })}
                </>
            ) : <p>Loading...</p>}
        </>
    );
}

export default PostDetail;