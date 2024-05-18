import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../store/appContext';
import '../styles/Login.css'

function Login() {
    const { actions, store } = useContext(Context);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    useEffect(() => {
        console.log('Current state in store:', store);
    }, [store]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    console.log('Login successful:', data);
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('user_info', JSON.stringify(data.user));
                    actions.login(data.user, data.access_token);
                    console.log('Check state after login', store);
                } else {
                    console.error('Login failed:', data.error);
                }
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <>
            <div className="login-container">
                <div className="login-container-center">
                    <div className="login-container-content">
                        <div className='login-content-title'>Log In</div>
                        <form onSubmit={handleSubmit} className="signup-form">
                            <div className='login-content-inputs'>
                                <div className='login-content-inputs-groups'>
                                    <label htmlFor="username">Username</label>
                                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                                </div>
                                <div className='login-content-inputs-groups'>
                                    <label htmlFor="password">Password</label>
                                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="login-buttons">
                                <button type="submit">Log In</button>
                            </div>
                        </form>
                    </div>
                </div>
                <footer className='login-footer'>
                    Developed by Rodrigo Barrera
                </footer>
            </div>
        </>
    );
}

export default Login;