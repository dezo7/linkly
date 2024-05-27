import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Context } from '../store/appContext';
import PostCard from '../components/PostCard';
import '../styles/Profile.css'

function Profile() {
    const { username } = useParams();
    const { store } = useContext(Context);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/profile/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setProfile(data);
                    setIsFollowing(data.is_following);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Failed to fetch data');
            });
    }, [username, store.token]);

    const handleFollow = () => {
        const userId = profile.id;
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
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        followers: data.newFollowerCount
                    }));
                    setIsFollowing(!isFollowing);
                }
            })
            .catch(err => console.error('Error:', err));
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!profile) {
        return null;
    }

    return (
        <>
            <div className='profile-title'>
                <div className='profile-title-title'>
                    <i className='fa-solid fa-user'></i>&nbsp;
                    {profile.first_name} {profile.last_name} @{profile.username}
                </div>
            </div>
            <div className='profile-content'>
                <div className='profile-content-follows'>
                    <span className='profile-content-follows-followers'>
                        <Link to={`/${username}/followers`}>
                            <strong>{profile.followers}</strong> Followers
                        </Link>
                    </span>
                    <span className='profile-content-follows-following'>
                        <Link to={`/${username}/following`}>
                            <strong>{profile.following}</strong> Following
                        </Link>
                    </span>
                </div>
                <div className='profile-content-info'>
                    <div className='profile-content-info-location'>
                        <i className='fa-solid fa-location-dot'></i> <strong>Location:</strong> {profile.location || 'Not specified'}
                    </div>
                    <div className='profile-content-info-date'>
                        <i className='fa-solid fa-calendar-days'></i> <strong>Registered at:</strong> {profile.registered_at || 'Not specified'}
                    </div>
                </div>
                {store.user.username !== username && (
                    <button onClick={handleFollow}>{isFollowing ? 'Unfollow' : 'Follow'}</button>
                )}
            </div>
            <div className='profile-title'>
                <div className='profile-title-title'>Posts</div>
            </div>
            {profile.posts.length > 0 ? (
                profile.posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="profile-no-posts-message">There are no posts in this profile at the moment.</div>
            )}
        </>
    );
}

export default Profile;