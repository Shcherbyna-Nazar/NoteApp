import React from 'react';
import {AppBar, Toolbar, Typography, Button, Box} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const CustomAppBar = () => {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const isAuthenticated = accessToken && refreshToken;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" onClick={() => navigate('/')}
                            sx={{cursor: 'pointer'}}>
                    Note App
                </Typography>

                {isAuthenticated && (
                    <Button color="inherit" onClick={() => navigate('/')} sx={{ml: 10}}>Home</Button>
                )}

                <Box sx={{flexGrow: 1}}></Box> {/* Добавляем пространство */}

                {!isAuthenticated && (
                    <>
                        <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                        <Button color="inherit" onClick={() => navigate('/register')} sx={{ml: 10}}>Register</Button>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <Button color="inherit" onClick={() => navigate('/register')} sx={{ml: 10}}>Register</Button>
                        <Button color="inherit" onClick={handleLogout} sx={{ml: 2}}>Logout</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default CustomAppBar;
