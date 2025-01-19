import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { supabase } from '../config/supabase';
import { RootState } from '../store';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            navigate('/tasks');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            dispatch(loginStart());
            
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw new Error(signInError.message);
            }

            if (data?.user) {
                dispatch(loginSuccess({
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        role: 'user', // Você pode ajustar isso baseado nos metadados do usuário
                        name: data.user.user_metadata?.name || email,
                    },
                    token: data.session?.access_token
                }));
                navigate('/tasks');
            }
        } catch (err) {
            dispatch(loginFailure(err instanceof Error ? err.message : 'Erro ao fazer login'));
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2C3333',
                backgroundImage: 'linear-gradient(135deg, #2C3333 25%, #1A1D1D 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        backgroundColor: 'background.paper',
                        p: 4,
                        borderRadius: 1,
                        border: '1px solid rgba(231, 246, 242, 0.12)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Credenciais de teste:
                        </Typography>
                        <Typography variant="body2" color="primary">
                            admin@example.com / 123456
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Login; 