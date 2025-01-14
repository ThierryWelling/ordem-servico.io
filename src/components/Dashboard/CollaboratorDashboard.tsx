import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ServiceOrder } from '../../types';
import { serviceOrderService } from '../../services/api';

const CollaboratorDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega as ordens de serviço do usuário
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;

      try {
        const response = await serviceOrderService.getServiceOrdersByUser(user.id);
        setTasks(response);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  // Filtra tarefas do usuário atual
  const userTasks = tasks.filter(task => task.assigned_to === user?.id);
  
  // Calcula estatísticas básicas
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = userTasks.filter(task => task.status === 'in_progress').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Meu Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Cartão de Resumo de Tarefas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Minhas Tarefas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h4" color="primary">
                    {totalTasks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="success.main">
                    {completedTasks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Concluídas
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="warning.main">
                    {pendingTasks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pendentes
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cartão de Tarefas em Andamento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Tarefas em Andamento
              </Typography>
              <Typography variant="h4" color="info.main">
                {inProgressTasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tarefas sendo executadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Tarefas Recentes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Tarefas Recentes
              </Typography>
              {userTasks.slice(0, 5).map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {task.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Prioridade: {task.priority}
                  </Typography>
                </Box>
              ))}
              {userTasks.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma tarefa encontrada
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaboratorDashboard; 