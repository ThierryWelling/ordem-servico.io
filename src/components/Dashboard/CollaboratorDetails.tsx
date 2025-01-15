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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user.profilePicture}
              alt={user.name}
              sx={{ width: 100, height: 100 }}
            >
              {user.name[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            <Typography color="textSecondary">
              {user.email}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Função: {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Tarefas do Colaborador
        </Typography>
        <UserDashboard userId={userId} />
      </Box>
    </Container>
  );
};

export default CollaboratorDetails; 