import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {TextField, Button, Container, Typography, Box, Alert} from '@mui/material';
import CustomAppBar from "../../CustomAppBar";

const Register = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault(); // Prevent the default form submission

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
                firstname,
                lastname,
                email,
                password,
                mfaEnabled: true,
            });

            if (response.status === 200) {
                navigate('/totp', {state: {qrCodeUri: response.data.secretImageUri, email: email}});
            }
        } catch (error) {
            console.log(error);
            const errMsg = error.response?.data || 'Registration error. Please try again.';
            setErrorMessage(errMsg);
            console.error('Register error:', error);
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
                        Register
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleRegister} sx={{mt: 1}}>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="firstname"
                            label="First Name"
                            name="firstname"
                            autoComplete="fname"
                            autoFocus
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="lastname"
                            label="Last Name"
                            name="lastname"
                            autoComplete="lname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
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
                        {errorMessage && <Alert
                            severity="error" sx={{mt: 2}}>
                            {errorMessage}
                        </Alert>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Register
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
};
export default Register;

