import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Context } from './store/appContext';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Search from './pages/Search';
import Followers from './pages/Followers';
import Following from './pages/Following';
import RequireAuth from './components/RequireAuth';
import RedirectIfAuth from './components/RedirectIfAuth';
import injectContext from './store/appContext';
import './styles/App.css';

function AuthenticatedLayout() {
    return (
        <>
            <Navbar />
            <div className="AppContent">
                <Outlet /> {/* Este componente renderiza los componentes de las rutas anidadas */}
            </div>
        </>
    );
}

function App() {
    const { store, actions } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            actions.validateToken(token).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [actions]);

    if (isLoading) {
        return null;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Rutas que no requieren autenticación */}
                    <Route path="/" element={<RedirectIfAuth><Welcome /></RedirectIfAuth>} />
                    <Route path="/signup" element={<RedirectIfAuth><Signup /></RedirectIfAuth>} />
                    <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
                    <Route path="*" element={<NotFound />} />

                    {/* Rutas que requieren autenticación */}
                    <Route element={<RequireAuth><AuthenticatedLayout /></RequireAuth>}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/:username" element={<Profile />} />
                        <Route path="/:username/post/:id" element={<PostDetail />} />
                        <Route path="/:username/followers" element={<Followers />} />
                        <Route path="/:username/following" element={<Following />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default injectContext(App);