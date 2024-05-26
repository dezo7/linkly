import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/Followers.css'

function Followers() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { store } = useContext(Context);
    const [followers, setFollowers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/${username}/followers`, {
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
                    setFollowers(data);
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

    const handleRemoveFollower = (e, userUsername, index) => {
        e.stopPropagation();
        fetch(`http://127.0.0.1:5000/remove_follower/${userUsername}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${store.token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Removed follower successfully') {
                    setFollowers(prevFollowers => {
                        const updatedFollowers = [...prevFollowers];
                        updatedFollowers.splice(index, 1);
                        return updatedFollowers;
                    });
                } else {
                    setError(data.error || 'Failed to remove follower');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Failed to remove follower');
            });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className='followers-title'>
                <div className='followers-title-title'>
                    Followers of {username}
                </div>
            </div>
            {followers.map((user, index) => (
                <div className='followers-users' key={user.username} onClick={() => handleNavigateToUserProfile(user.username)}>
                    <div className='followers-users-left'>
                        <div className='followers-users-left-name'>{user.name}</div>
                        <div className='followers-users-left-username'>@{user.username}</div>
                    </div>
                    {store.user.username === username && (
                        <div className='followers-users-right' onClick={(e) => handleRemoveFollower(e, user.username, index)}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}

export default Followers;