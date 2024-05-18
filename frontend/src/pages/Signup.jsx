import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dateOfBirth: '',
        location: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    setSuccessMessage('Cuenta creada con éxito, redirigiendo al login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    console.error('Error:', data.error);
                }
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <>
            {successMessage && (
                <div className="signup-success-message">
                    {successMessage}
                </div>
            )}
            <div className={`signup-container ${successMessage ? 'signup-blurred' : ''}`}>
                <div className="signup-container-center">
                    <div className="signup-container-content">
                        <div className='signup-content-title'>Sign Up</div>
                        <form onSubmit={handleSubmit} className="signup-form">
                            <div className='signup-content-inputs'>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="username">Username</label>
                                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                                </div>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="firstName">First Name</label>
                                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                </div>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="lastName">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                </div>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="password">Password</label>
                                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div className='signup-content-inputs-groups'>
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="signup-buttons">
                                <button type="submit">Sign Up</button>
                            </div>
                        </form>
                    </div>
                </div>
                <footer className='signup-footer'>
                    Developed by Rodrigo Barrera
                </footer>
            </div>
        </>
    );
}

export default Signup;