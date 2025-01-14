import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ServiceOrder, User } from '../../types';
import { serviceOrderService, authService } from '../../services/api';

interface UserDashboardProps {
  userId: string;
  isAdminView?: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId, isAdminView = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, tasksData] = await Promise.all([
          authService.getUsers().then(users => users.find(u => u.id === userId)),
          serviceOrderService.getServiceOrders()
        ]);

        if (userData) {
          setUser(userData);
        }
        
        setTasks(tasksData.filter(task => task.assigned_to === userId));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Usuário não encontrado</Typography>
      </Box>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const pendingTasks = tasks.filter(task => task.status === 'pending');

  const efficiency = tasks.length > 0
    ? (completedTasks.length / tasks.length) * 100
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Estatísticas */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total de Tarefas
              </Typography>
              <Typography variant="h3">{tasks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Em Progresso
              </Typography>
              <Typography variant="h3">{inProgressTasks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Concluídas
              </Typography>
              <Typography variant="h3">{completedTasks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Eficiência
              </Typography>
              <Typography variant="h3">{Math.round(efficiency)}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Tarefas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tarefas Recentes
              </Typography>
              {tasks.length === 0 ? (
                <Typography color="textSecondary">
                  Nenhuma tarefa encontrada
                </Typography>
              ) : (
                tasks.map(task => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{task.title}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Status: {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                      </Typography>
                      <Typography variant="body2">{task.description}</Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard; 