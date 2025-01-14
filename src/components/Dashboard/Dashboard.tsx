import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AdminDashboard from './AdminDashboard';
import CollaboratorDashboard from './CollaboratorDashboard';
import { Box, Typography } from '@mui/material';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          Você precisa fazer login para acessar o painel
        </Typography>
      </Box>
    );
  }

  // Mostra o painel apropriado baseado no papel do usuário
  return user.role === 'admin' ? <AdminDashboard /> : <CollaboratorDashboard />;
};

export default Dashboard; 