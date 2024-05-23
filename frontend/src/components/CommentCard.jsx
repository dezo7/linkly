import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/CommentCard.css';

function CommentCard({ comment, onDelete }) {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const [likesCount, setLikesCount] = useState(comment.likes_count);
    const [likedByMe, setLikedByMe] = useState(comment.liked_by_me);
    const [isFollowing, setIsFollowing] = useState(comment.is_following);
    const [showMenu, setShowMenu] = useState(false);
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

    const toggleMenu = (event) => {
        event.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleLike = () => {
        const url = `http://127.0.0.1:5000/comments/${comment.comment_id}/toggle_like`;
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
                setLikesCount(data.new_likes_count);
                setLikedByMe(data.liked_by_me);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleFollow = () => {
        const userId = comment.comment_author_id;
        fetch(`http://127.0.0.1:5000/follow/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.newFollowerCount !== undefined) {
                    setIsFollowing(!isFollowing);
                }
            })
            .catch(err => console.error('Error:', err));
    };

    const handleDelete = () => {
        const url = `http://127.0.0.1:5000/comments/${comment.comment_id}`;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log('Comment deleted successfully');
                    onDelete(comment.comment_id);  // Llama a la función pasada por props para actualizar el estado en el componente padre
                    // Opcional: actualiza el estado del componente padre para reflejar el cambio
                } else {
                    console.error('Failed to delete the comment');
                }
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <div className='commentcard-item'>
            <div className='commentcard-item-title'>
                <div className='commentcard-item-title-left'>
                    <span className='commentcard-item-title-name'>
                        <Link to={`/${comment.comment_author_username}`}>
                            {comment.comment_author_name} {comment.comment_author_lastname}
                        </Link>
                    </span>&nbsp;
                    <span className='postcard-item-title-username'>
                        <Link to={`/${comment.comment_author_username}`}>
                            @{comment.comment_author_username}
                        </Link>
                    </span>&nbsp;·&nbsp;
                    <span title={comment.comment_created_at.absolute}>
                        {comment.comment_created_at.relative}
                    </span>
                </div>
                <div className='commentcard-item-title-right'>
                    <span ref={menuRef} onClick={toggleMenu}>
                        <i className='fa-solid fa-ellipsis'></i>
                    </span>
                    {showMenu && (
                        <div className='commentcard-menu' ref={menuContainerRef}>
                            <ul>
                                {store.user.username !== comment.comment_author_username && (
                                    <>

                                        <li onClick={() => navigate(`/${comment.comment_author_username}`)}>
                                            <i className='fa-solid fa-user'></i>Profile
                                        </li>
                                        <li onClick={handleFollow}>
                                            {isFollowing ? (
                                                <>
                                                    <i className="fa-solid fa-minus"></i>Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-plus"></i>Follow
                                                </>
                                            )}
                                        </li>
                                    </>
                                )}
                                {store.user.username === comment.comment_author_username && (
                                    <li onClick={handleDelete}>
                                        <i className='fa-solid fa-trash'></i> Delete
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <p className='commentcard-item-content'>
                {comment.comment_content}
            </p>
            <div className='commentcard-item-interactions'>
                <span className='commentcard-item-interactions-likes' onClick={handleLike}>
                    <i className={likedByMe ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>&nbsp;
                    {likesCount}
                </span>
            </div>
        </div>
    );
}

export default CommentCard;