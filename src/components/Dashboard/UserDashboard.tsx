import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { ServiceOrder } from '../../types';
import { serviceOrderService } from '../../services';

interface UserDashboardProps {
  userId: string;
  isAdmin?: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId, isAdmin }) => {
  const [serviceOrders, setServiceOrders] = React.useState<ServiceOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadServiceOrders = async () => {
      try {
        setLoading(true);
        const orders = await serviceOrderService.getUserServiceOrders(userId);
        setServiceOrders(orders);
      } catch (error) {
        console.error('Erro ao carregar ordens de serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServiceOrders();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const pendingOrders = serviceOrders.filter(order => order.status === 'pending');
  const inProgressOrders = serviceOrders.filter(order => order.status === 'in_progress');
  const completedOrders = serviceOrders.filter(order => order.status === 'completed');

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pendentes
            </Typography>
            <List>
              {pendingOrders.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={order.title}
                    secondary={order.description}
                  />
                  <Chip
                    label={order.priority}
                    color={order.priority === 'high' ? 'error' : order.priority === 'medium' ? 'warning' : 'info'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Em Andamento
            </Typography>
            <List>
              {inProgressOrders.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={order.title}
                    secondary={order.description}
                  />
                  <Chip
                    label={order.priority}
                    color={order.priority === 'high' ? 'error' : order.priority === 'medium' ? 'warning' : 'info'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Concluídas
            </Typography>
            <List>
              {completedOrders.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={order.title}
                    secondary={order.description}
                  />
                  <Chip
                    label="Concluída"
                    color="success"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard; 