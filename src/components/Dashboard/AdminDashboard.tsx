import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ServiceOrder } from '../../types';
import { serviceOrderService } from '../../services';

const AdminDashboard: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await serviceOrderService.getServiceOrders();
        setServiceOrders(orders);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatistics = () => {
    const total = serviceOrders.length;
    const completed = serviceOrders.filter(order => order.status === 'completed').length;
    const inProgress = serviceOrders.filter(order => order.status === 'in_progress').length;
    const pending = serviceOrders.filter(order => order.status === 'pending').length;

    return { total, completed, inProgress, pending };
  };

  const stats = getStatistics();

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Box bgcolor="primary.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Total de Ordens</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box bgcolor="success.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Concluídas</Typography>
            <Typography variant="h4">{stats.completed}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box bgcolor="warning.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Em Andamento</Typography>
            <Typography variant="h4">{stats.inProgress}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box bgcolor="error.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Pendentes</Typography>
            <Typography variant="h4">{stats.pending}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 