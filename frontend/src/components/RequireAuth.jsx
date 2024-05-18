import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../store/appContext';

function RequireAuth({ children }) {
    const { store } = useContext(Context);
    const { isAuthenticated } = store;

    return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default RequireAuth;