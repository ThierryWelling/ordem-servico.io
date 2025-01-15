import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import { User } from '../../types';
import UserDashboard from './UserDashboard';
import api from '../../services/api';

const CollaboratorDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setError('ID do usuário não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setError('Erro ao carregar dados do usuário. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (!userId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">
          {error || 'Usuário não encontrado'}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main'
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Membro desde {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Desempenho e Atividades
        </Typography>

        <UserDashboard userId={userId} isAdmin={true} />
      </Box>
    </Container>
  );
};

export default CollaboratorDetails; 