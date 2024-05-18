import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../store/appContext';
import PostCard from './PostCard';

function MyFeed({ shouldFetchPosts, setShouldFetchPosts }) {
    const { store } = useContext(Context);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = () => {
        setLoading(true);
        fetch('http://127.0.0.1:5000/feed', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${store.token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (shouldFetchPosts) {
            fetchPosts();
            setShouldFetchPosts(false);
        }
    }, [shouldFetchPosts]);

    if (loading) {
        return null;
    }

    return (
        <>
            {posts.length > 0 ? (
                posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="home-no-posts-message">There are no posts in your feed at the moment.</div>
            )}
        </>
    );
}

export default MyFeed;