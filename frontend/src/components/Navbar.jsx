import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/Navbar.css'

function Navbar() {
  const { actions, store } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.logout();
    navigate('/');
  };


  return (
    <>
      <div className="navbar">
        <Link to="/home" className="nav-link"><i className="fa-solid fa-house"></i></Link>
        <Link to="/search" className="nav-link"><i className="fa-solid fa-magnifying-glass"></i></Link>
        <Link to={`/${store.user.username}`} className="nav-link"><i className="fa-solid fa-user"></i></Link>
        <a href="#" onClick={handleLogout} className="nav-link"><i className="fa-solid fa-right-from-bracket"></i></a>
      </div>
    </>
  );
}

export default Navbar;