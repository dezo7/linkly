import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../store/appContext';

function RedirectIfAuth({ children }) {
    const { store } = useContext(Context);
    const { isAuthenticated } = store;

    return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

export default RedirectIfAuth;