import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/PostCard.css'

function PostCard({ post }) {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [likedByMe, setLikedByMe] = useState(post.liked_by_me);
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

    const handleNavigateToPost = () => {
        navigate(`/${post.author_username}/post/${post.id}`);
    };

    const handleNavigateToUserProfile = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`);
    };

    const handleStopPropagation = (event) => {
        event.stopPropagation();
    };

    const handleLike = (event, postId) => {
        event.stopPropagation();
        fetch(`http://127.0.0.1:5000/posts/${postId}/toggle_like`, {
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

    const toggleMenu = (event) => {
        event.stopPropagation();
        if (showMenu && menuRef.current && menuRef.current.contains(event.target)) {
            setShowMenu(false);
        } else {
            setShowMenu(!showMenu);
        }
    };

    const handleDeletePost = (event) => {
        event.stopPropagation();
        fetch(`http://127.0.0.1:5000/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log('Post deleted successfully');
                    navigate('/');
                } else {
                    console.error('Failed to delete the post');
                }
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <div key={post.id} className='postcard-item' onClick={handleNavigateToPost}>
            <div className='postcard-item-title'>
                <div className='postcard-item-title-left'>
                    <span className='postcard-item-title-name' onClick={handleStopPropagation}>
                        <Link to={`/${post.author_username}`}>
                            {`${post.author_name} ${post.author_lastname}`}
                        </Link>
                    </span>&nbsp;
                    <span className='postcard-item-title-username' onClick={handleStopPropagation}>
                        <Link to={`/${post.author_username}`}>
                            @{post.author_username}
                        </Link>
                    </span>&nbsp;·&nbsp;
                    <span title={post.created_at.absolute} onClick={handleStopPropagation}>
                        <Link to={`/${post.author_username}/post/${post.id}`}>
                            {post.created_at.relative}
                        </Link>
                    </span>
                </div>
                <div className='postcard-item-title-right'>
                    <span ref={menuRef} onClick={toggleMenu}>
                        <i className='fa-solid fa-ellipsis'></i>
                    </span>
                    {showMenu && (
                        <div className='postcard-menu' ref={menuContainerRef}>
                            <ul>
                                {store.user.username !== post.author_username && (
                                    <li onClick={(e) => handleNavigateToUserProfile(e, post.author_username)}>
                                        <i className='fa-solid fa-user'></i>
                                        Profile
                                    </li>
                                )}
                                {store.user.username === post.author_username && (
                                    <li onClick={handleDeletePost}>
                                        <i className='fa-solid fa-trash'></i>
                                        Delete
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <p className='postcard-item-content'>
                {post.content}
            </p>
            <div className='postcard-item-interactions'>
                <span className='postcard-item-interactions-likes' onClick={(e) => handleLike(e, post.id)}>
                    <i className={likedByMe ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>&nbsp;
                    {likesCount}
                </span>
                <span className='postcard-item-interactions-comments'>
                    <i className='fa-regular fa-comment'></i>&nbsp;
                    {post.comments_count}
                </span>
            </div>
        </div>
    );
}

export default PostCard;