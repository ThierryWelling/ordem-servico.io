import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ServiceOrder, User } from '../../types';
import { serviceOrderService, userService } from '../../services';

const AdminDashboard: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersData, usersData] = await Promise.all([
          serviceOrderService.getServiceOrders(),
          userService.getUsers()
        ]);
        setServiceOrders(ordersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatistics = () => {
    const totalTasks = serviceOrders.length;
    const completedTasks = serviceOrders.filter(order => order.status === 'completed').length;
    const inProgressTasks = serviceOrders.filter(order => order.status === 'in_progress').length;
    const pendingTasks = serviceOrders.filter(order => order.status === 'pending').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks
    };
  };

  const stats = getStatistics();

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6">Total de Tarefas</Typography>
            <Typography variant="h4">{stats.totalTasks}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6">Concluídas</Typography>
            <Typography variant="h4">{stats.completedTasks}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h6">Em Progresso</Typography>
            <Typography variant="h4">{stats.inProgressTasks}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="h6">Pendentes</Typography>
            <Typography variant="h4">{stats.pendingTasks}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 