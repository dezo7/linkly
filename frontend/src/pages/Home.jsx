import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import Feed from '../components/MyFeed';
import Global from '../components/GlobalFeed';
import '../styles/Home.css'

function Home() {
    const { store } = useContext(Context);
    const [feedType, setFeedType] = useState('personal');
    const [content, setContent] = useState('');
    const [shouldFetchPosts, setShouldFetchPosts] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedContent = content.trim();
        if (trimmedContent) {
            fetch('http://127.0.0.1:5000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.token}`
                },
                body: JSON.stringify({ content: trimmedContent })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Post created successfully.') {
                        setShouldFetchPosts(true);
                        setContent('');
                    } else {
                        alert('Failed to create post: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to create post. Please try again later.');
                });
        } else {
            alert('The post cannot be empty.');
        }
    };

    return (
        <>
            <div className='home-title'>
                <div className='home-title-titles' onClick={() => setFeedType('personal')}>My Feed</div>
                <div className='home-title-titles' onClick={() => setFeedType('global')}>Explore</div>
            </div>
            <div className='newpost'>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className='newpost-input'
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        rows="3"
                    ></textarea>
                    <button className='newpost-button' type="submit" disabled={!content.trim()}>
                        Post
                    </button>
                </form>
            </div>
            {feedType === 'personal' ? <Feed shouldFetchPosts={shouldFetchPosts} setShouldFetchPosts={setShouldFetchPosts} /> : <Global shouldFetchPosts={shouldFetchPosts} setShouldFetchPosts={setShouldFetchPosts} />}
        </>
    );
}

export default Home;