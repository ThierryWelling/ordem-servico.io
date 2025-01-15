import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ServiceOrder } from '../../types';
import { serviceOrderService } from '../../services';

interface CollaboratorDashboardProps {
  userId: string;
}

const CollaboratorDashboard: React.FC<CollaboratorDashboardProps> = ({ userId }) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const orders = await serviceOrderService.getServiceOrders();
        setServiceOrders(orders.filter(order => order.assignedTo === userId));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const getStatistics = () => {
    const totalTasks = serviceOrders.length;
    const completedTasks = serviceOrders.filter(order => order.status === 'completed').length;
    const inProgressTasks = serviceOrders.filter(order => order.status === 'in_progress').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks
    };
  };

  const stats = getStatistics();

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meu Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6">Total de Tarefas</Typography>
            <Typography variant="h4">{stats.totalTasks}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6">Concluídas</Typography>
            <Typography variant="h4">{stats.completedTasks}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h6">Em Progresso</Typography>
            <Typography variant="h4">{stats.inProgressTasks}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaboratorDashboard; 