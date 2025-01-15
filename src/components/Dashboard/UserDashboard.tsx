import React, { useState, useEffect } from 'react';
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

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tasksData = await serviceOrderService.getServiceOrders();
        const userTasks = tasksData.filter(task => task.assigned_to === userId);
        setTasks(userTasks);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in_progress':
        return 'Em Progresso';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Minhas Tarefas
            </Typography>
            <List>
              {tasks.map((task) => (
                <ListItem key={task.id} divider>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <>
                        {task.description}
                        <Box mt={1}>
                          <Chip
                            label={getStatusText(task.status)}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {tasks.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Nenhuma tarefa encontrada"
                    secondary="Você não possui tarefas atribuídas no momento"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard; 