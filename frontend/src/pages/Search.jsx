import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/Search.css'

function Search() {
    const { store } = useContext(Context);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query) {
                fetch(`http://127.0.0.1:5000/search_users?q=${query}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                })
                    .then(response => response.json())
                    .then(data => setResults(data))
                    .catch(error => console.error('Error:', error));
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, store.token]);

    const navigateToUser = (username) => {
        navigate(`/${username}`);
    };

    return (
        <>
            <div className='search-title'>
                <div className='search-title-title'><i className='fa-solid fa-magnifying-glass'></i> Search</div>
            </div>
            <div className='search-content'>
                <input
                    className='search-input'
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search and find your friends"
                />
            </div>
            <div className='search-results'>
                {results.map(user => (
                    <div className='search-results-result' key={user.username} onClick={() => navigateToUser(user.username)}>
                        <div className='search-results-result-name'>{user.name}</div>
                        <div className='search-results-result-username'>@{user.username}</div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Search;