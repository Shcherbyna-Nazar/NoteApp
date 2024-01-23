import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';
import {TextField, Button, Container, Typography, Box, Alert, Paper, Grid} from '@mui/material';
import CustomAppBar from "../CustomAppBar";

const TOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const qrCodeUri = location.state?.qrCodeUri;

    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleVerifyCode = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/verify', {
                email,
                code,
            });

            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                navigate('/');
            }
        } catch (error) {
            setErrorMessage('Error verifying code. Please try again.');
        }
    };

    return (
        <>
            <CustomAppBar/>
            <Container component="main" maxWidth="sm">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        TOTP Authentication
                    </Typography>
                    <Paper elevation={3} sx={{p: 2, mt: 3, mb: 3, width: '100%'}}>
                        {qrCodeUri && (
                            <Grid container spacing={2} justifyContent="center">
                                <Grid item xs={12}>
                                    <Typography align="center">Scan this QR Code with your Authenticator
                                        App:</Typography>
                                </Grid>
                                <Grid item>
                                    <img src={qrCodeUri} alt="QR Code" style={{maxWidth: '100%', height: 'auto'}}/>
                                </Grid>
                            </Grid>
                        )}
                        <Box component="form" noValidate onSubmit={handleVerifyCode} sx={{mt: 3}}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="code"
                                label="One-Time Code"
                                name="code"
                                autoComplete="off"
                                autoFocus
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
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
                                Verify
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </>
    );
};

export default TOTP;
