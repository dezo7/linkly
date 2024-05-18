import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/Following.css'

function Following() {
    const { username } = useParams();
    const navigate = useNavigate();
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
            {following.map(user => (
                <div className='following-users' key={user.username} onClick={() => handleNavigateToUserProfile(user.username)}>
                    <b>{user.name}</b> (@{user.username})
                </div>
            ))}
        </>
    );
}

export default Following;