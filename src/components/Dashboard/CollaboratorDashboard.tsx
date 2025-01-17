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
    const fetchServiceOrders = async () => {
      try {
        const orders = await serviceOrderService.getServiceOrders();
        const filteredOrders = orders.filter(order => order.assignedTo === userId);
        setServiceOrders(filteredOrders);
      } catch (error) {
        console.error('Erro ao carregar ordens de serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOrders();
  }, [userId]);

  const getStatistics = () => {
    const total = serviceOrders.length;
    const completed = serviceOrders.filter(order => order.status === 'completed').length;
    const inProgress = serviceOrders.filter(order => order.status === 'in_progress').length;

    return { total, completed, inProgress };
  };

  const stats = getStatistics();

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard do Colaborador
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box bgcolor="primary.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Total de Tarefas</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box bgcolor="success.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Tarefas Concluídas</Typography>
            <Typography variant="h4">{stats.completed}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box bgcolor="warning.main" p={3} borderRadius={2} color="white">
            <Typography variant="h6">Tarefas em Andamento</Typography>
            <Typography variant="h4">{stats.inProgress}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaboratorDashboard; 