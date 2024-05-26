import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/Following.css';

function Following() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { store } = useContext(Context);
    const [following, setFollowing] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/${username}/following`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${store.token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setFollowing(data);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Failed to fetch data');
            });
    }, [username, store.token]);

    const handleNavigateToUserProfile = (userUsername) => {
        navigate(`/${userUsername}`);
    };

    const handleUnfollow = (e, userUsername, index) => {
        e.stopPropagation();
        fetch(`http://127.0.0.1:5000/unfollow/${userUsername}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${store.token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Unfollowed successfully') {
                    setFollowing(prevFollowing => {
                        const updatedFollowing = [...prevFollowing];
                        updatedFollowing.splice(index, 1);
                        return updatedFollowing;
                    });
                } else {
                    setError(data.error || 'Failed to unfollow user');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Failed to unfollow user');
            });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className='following-title'>
                <div className='followers-title-title'>
                    Following by {username}
                </div>
            </div>
            {following.map((user, index) => (
                <div className='following-users' key={user.username} onClick={() => handleNavigateToUserProfile(user.username)}>
                    <div className='following-users-left'>
                        <div className='following-users-left-name'>{user.name}</div>
                        <div className='following-users-left-username'>@{user.username}</div>
                    </div>
                    {store.user.username === username && (
                        <div className='following-users-right' onClick={(e) => handleUnfollow(e, user.username, index)}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}

export default Following;