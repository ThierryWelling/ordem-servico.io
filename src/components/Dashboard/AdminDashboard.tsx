import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { User, ServiceOrder } from '../../types';
import { serviceOrderService, authService } from '../../services/api';
import UserDashboard from './UserDashboard';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserDashboard, setOpenUserDashboard] = useState(false);
  const navigate = useNavigate();

  // Carrega os usuários e tarefas do banco de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, tasksData] = await Promise.all([
          authService.getUsers(),
          serviceOrderService.getServiceOrders()
        ]);
        setUsers(usersData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenUserDashboard = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setOpenUserDashboard(true);
  };

  const handleCloseUserDashboard = () => {
    setSelectedUser(null);
    setOpenUserDashboard(false);
  };

  const handleViewCollaboratorDetails = (collaborator: User) => {
    navigate(`/collaborator/${collaborator.id}`);
  };

  // Estatísticas gerais
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;

  // Dados para o gráfico de distribuição de tarefas
  const taskDistributionData = [
    { name: 'Concluídas', value: completedTasks },
    { name: 'Em Progresso', value: inProgressTasks },
    { name: 'Pendentes', value: pendingTasks },
  ];

  // Cores para o gráfico de pizza
  const COLORS = ['#00A67E', '#FFB800', '#E94560'];

  // Dados para o gráfico de barras de produtividade por usuário
  const userProductivityData = users
    .filter((u) => u.role !== 'admin')
    .map((u) => {
      const userTasks = tasks.filter((task) => task.assigned_to === u.id);
      const completed = userTasks.filter((task) => task.status === 'completed').length;
      return {
        name: u.name,
        tarefasConcluidas: completed,
        tarefasPendentes: userTasks.length - completed,
      };
    });

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
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total de Tarefas
              </Typography>
              <Typography variant="h3">{totalTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Taxa de Conclusão
              </Typography>
              <Typography variant="h3">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Tarefas Concluídas
              </Typography>
              <Typography variant="h3">{completedTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Tarefas em Progresso
              </Typography>
              <Typography variant="h3">{inProgressTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza - Distribuição de Tarefas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Distribuição de Tarefas
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {taskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Barras - Produtividade por Usuário */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Produtividade por Usuário
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userProductivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tarefasConcluidas" stackId="a" fill="#00A67E" name="Concluídas" />
                    <Bar dataKey="tarefasPendentes" stackId="a" fill="#E94560" name="Pendentes" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Usuários e Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Status dos Colaboradores
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Colaborador</TableCell>
                      <TableCell>Tarefas Totais</TableCell>
                      <TableCell>Concluídas</TableCell>
                      <TableCell>Em Progresso</TableCell>
                      <TableCell>Eficiência</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .filter((u) => u.role !== 'admin')
                      .map((u) => {
                        const userTasks = tasks.filter((task) => task.assigned_to === u.id);
                        const userCompleted = userTasks.filter((task) => task.status === 'completed').length;
                        const userInProgress = userTasks.filter((task) => task.status === 'in_progress').length;
                        const userEfficiency = userTasks.length > 0 ? (userCompleted / userTasks.length) * 100 : 0;

                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar alt={u.name}>
                                  {u.name[0]}
                                </Avatar>
                                <Typography>{u.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{userTasks.length}</TableCell>
                            <TableCell>{userCompleted}</TableCell>
                            <TableCell>{userInProgress}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={userEfficiency}
                                  size={24}
                                  thickness={4}
                                  sx={{ color: userEfficiency > 70 ? '#00A67E' : '#E94560' }}
                                />
                                <Typography variant="body2">
                                  {Math.round(userEfficiency)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={userInProgress > 0 ? 'Ativo' : 'Disponível'}
                                color={userInProgress > 0 ? 'success' : 'primary'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleViewCollaboratorDetails(u)}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal do Painel do Usuário */}
      <Dialog
        open={openUserDashboard}
        onClose={handleCloseUserDashboard}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Painel do Colaborador: {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <UserDashboard userId={selectedUser.id} isAdminView={true} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 