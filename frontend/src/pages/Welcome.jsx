import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css'

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <div className="welcome-container">
        <div className="welcome-container-center">
          <div className="welcome-container-content">
            <div className='welcome-content-title'>Welcome to Linkly</div>
            <div className='welcome-content-p'>Connect with friends and share special moments.</div>
            <div className="welcome-buttons">
              <button className="welcome-buttons-signup" onClick={handleSignup}>Sign Up</button>
              <button className="welcome-buttons-login" onClick={handleLogin}>Log In</button>
            </div>
          </div>
        </div>
        <footer className='welcome-footer'>
          Developed by Rodrigo Barrera
        </footer>
      </div>
    </>
  );
}

export default Welcome;