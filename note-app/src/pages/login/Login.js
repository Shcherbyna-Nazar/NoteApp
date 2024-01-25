import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {TextField, Button, Container, Typography, Box, Alert} from '@mui/material';
import CustomAppBar from "../../CustomAppBar";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();  // Prevent default form submission behavior

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/authenticate', {
                email,
                password,
            });

            if (response.data.mfaEnabled) {
                navigate('/totp', {state: {qrCodeUri: response.data.secretImageUri, email: email}});
            } else {
                navigate('/');
            }
        } catch (error) {
            const errMsg = error.response?.data || 'Authentication error. Please try again.';
            setErrorMessage(errMsg);
        }
    };

    return (
        <>
            <CustomAppBar/>
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleLogin} sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errorMessage && (
                            <Alert severity="error" sx={{mt: 2}}>
                                {errorMessage}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Login
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Login;
