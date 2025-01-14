import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Fab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, User } from '../types';
import { serviceOrderService, authService } from '../services/api';
import TaskEditDialog from './TaskEditDialog';
import CreateTaskDialog from './CreateTaskDialog';
import UserSequenceDialog from './UserSequenceDialog';

interface TaskListProps {
  collaboratorId?: string;
  isAdminView?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'in_progress':
      return <ScheduleIcon sx={{ color: 'warning.main' }} />;
    default:
      return <ErrorIcon sx={{ color: 'error.main' }} />;
  }
};

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

const TaskList: React.FC<TaskListProps> = ({ collaboratorId, isAdminView = false }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [selectedTask, setSelectedTask] = useState<ServiceOrder | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<ServiceOrder | null>(null);
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ServiceOrder | null>(null);

  const isAdmin = user?.role === 'admin';

  const getVisibleUsers = () => {
    if (!user) return [];
    
    if (collaboratorId) {
      return users.filter(u => u.id === collaboratorId);
    }
    
    if (isAdmin) {
      return users.filter(u => u.role === 'collaborator');
    }
    
    // Encontrar o usuário atual e o próximo na sequência
    const currentUser = users.find(u => u.id === user.id);
    if (!currentUser || !currentUser.sequence) return [currentUser];
    
    const nextUser = users.find(u => u.sequence === currentUser.sequence + 1);
    return nextUser ? [currentUser, nextUser] : [currentUser];
  };

  const canDropTask = (sourceUserId: string, targetUserId: string): boolean => {
    if (!user) return false;
    
    // Admin pode mover para qualquer um
    if (isAdmin) return true;

    const sourceUser = users.find(u => u.id === sourceUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    
    if (!sourceUser || !targetUser || !sourceUser.sequence || !targetUser.sequence) return false;

    // Usuário só pode mover suas próprias tarefas
    if (sourceUserId !== user.id) return false;

    // Colaborador só pode passar para o próximo da sequência
    return targetUser.sequence === sourceUser.sequence + 1;
  };

  const handleDrop = async (e: React.DragEvent, targetUserId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const canDrop = canDropTask(draggedTask.assigned_to || '', targetUserId);
    
    if (!canDrop) {
      setSnackbar({
        open: true,
        message: 'Você só pode passar a tarefa para o próximo nível na sequência',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await serviceOrderService.updateServiceOrder(draggedTask.id, {
        ...draggedTask,
        assigned_to: targetUserId,
        status: 'in_progress'
      });

      const updatedTasks = await serviceOrderService.getServiceOrders();
      setTasks(updatedTasks);

      setSnackbar({
        open: true,
        message: 'Tarefa movida com sucesso',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao mover tarefa',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDraggedTask(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [tasksData, usersData] = await Promise.all([
          serviceOrderService.getServiceOrders(),
          authService.getUsers()
        ]);

        // Se tiver collaboratorId, filtra apenas as tarefas desse colaborador
        const filteredTasks = collaboratorId 
          ? tasksData.filter(task => task.assigned_to === collaboratorId)
          : tasksData;

        setTasks(filteredTasks);
        setUsers(usersData.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, collaboratorId]);

  // Adiciona listener para o evento de criação de tarefa
  useEffect(() => {
    const handleCreateTask = (event: CustomEvent) => {
      setCreateTaskDialogOpen(true);
      // Se tiver um usuário atribuído no evento, vamos pré-selecionar ele
      if (event.detail?.assignedTo) {
        // Aqui você pode passar o assignedTo para o CreateTaskDialog
        // através de um novo estado ou prop
      }
    };

    document.addEventListener('createTask', handleCreateTask as EventListener);

    return () => {
      document.removeEventListener('createTask', handleCreateTask as EventListener);
    };
  }, []);

  const handleDragStart = (task: ServiceOrder) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDeleteClick = (task: ServiceOrder, event: React.MouseEvent) => {
    event.stopPropagation();
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await serviceOrderService.deleteServiceOrder(taskToDelete.id);
      const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
      setTasks(updatedTasks);
      setSnackbar({
        open: true,
        message: 'Tarefa excluída com sucesso',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir tarefa',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleEditTask = (task: ServiceOrder) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedTask(null);
    setEditDialogOpen(false);
  };

  const handleTaskSaved = async () => {
    try {
      const response = await serviceOrderService.getServiceOrders();
      setTasks(response);
      setSnackbar({
        open: true,
        message: 'Tarefa atualizada com sucesso',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao recarregar tarefas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar tarefa',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 3,
        pb: 2
      }}>
        <Typography variant="h4">
          {isAdmin ? 'Todas as Tarefas' : 'Minhas Tarefas'}
        </Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setSequenceDialogOpen(true)}
          >
            Gerenciar Sequência
          </Button>
        )}
      </Box>

      <Box 
        sx={{ 
          flex: 1,
          overflowX: isAdmin ? 'auto' : 'hidden',
          overflowY: 'hidden',
          px: 3,
          // Estilização da barra de rolagem horizontal
          '&::-webkit-scrollbar': {
            height: '8px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.primary.main,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.primary.dark
            }
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: isAdmin ? 'row' : 'column',
            gap: 3,
            minWidth: isAdmin ? 'fit-content' : 'auto',
            height: '100%'
          }}
        >
          {getVisibleUsers().map((currentUser) => {
            if (!currentUser) return null;
            
            const userTasks = tasks.filter(task => task.assigned_to === currentUser.id);
            const isNextUser = !isAdmin && currentUser.id !== user?.id;
            
            return (
              <Box 
                key={currentUser.id}
                sx={{ 
                  width: isAdmin ? '400px' : '100%',
                  flex: isAdmin ? '0 0 auto' : 1,
                  height: '100%'
                }}
              >
                <Paper
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isNextUser ? 'action.hover' : 'background.paper',
                    borderRadius: 3,
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 4px 20px 0 rgba(0,0,0,0.4)'
                        : '0 4px 20px 0 rgba(0,0,0,0.1)',
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentUser.id)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    bgcolor: isNextUser ? 'secondary.dark' : 'primary.dark',
                    borderRadius: '12px 12px 0 0',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: isNextUser ? 'secondary.main' : 'primary.main',
                          width: 48,
                          height: 48,
                          mr: 2,
                          border: '2px solid',
                          borderColor: isNextUser ? 'secondary.light' : 'primary.light',
                        }}
                      >
                        {currentUser.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'common.white' }}>
                          {currentUser.name}
                          {isNextUser && ' (Próximo)'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: isNextUser ? 'secondary.light' : 'primary.light' }}>
                          Nível {currentUser.sequence ?? 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box 
                    sx={{ 
                      flex: 1,
                      p: 2,
                      overflowY: 'auto',
                      // Estilização da barra de rolagem vertical
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        backgroundColor: 'transparent'
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: '4px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => 
                          isNextUser ? theme.palette.secondary.main : theme.palette.primary.main,
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: (theme) => 
                            isNextUser ? theme.palette.secondary.dark : theme.palette.primary.dark
                        }
                      }
                    }}
                  >
                    {userTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        sx={{
                          mb: 2,
                          cursor: 'grab',
                          '&:hover': {
                            boxShadow: 3,
                          },
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
                              {task.title}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteClick(task, e)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              size="small"
                              label={task.status === 'completed' ? 'Concluído' : task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                              color={getStatusColor(task.status)}
                              icon={getStatusIcon(task.status)}
                            />
                            {task.checklist && (
                              <Typography variant="body2" color="text.secondary">
                                {task.checklist.filter(item => item.completed).length}/{task.checklist.length} itens
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    {userTasks.length === 0 && (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          color: 'text.secondary',
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          Nenhuma tarefa encontrada
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Tooltip title="Criar Nova Tarefa">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setCreateTaskDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        initialAssignedTo={collaboratorId}
        onSave={async () => {
          try {
            const response = await serviceOrderService.getServiceOrders();
            setTasks(response);
            setSnackbar({
              open: true,
              message: 'Tarefa criada com sucesso',
              severity: 'success'
            });
          } catch (error) {
            console.error('Erro ao recarregar tarefas:', error);
            setSnackbar({
              open: true,
              message: 'Erro ao atualizar lista de tarefas',
              severity: 'error'
            });
          }
        }}
      />

      <TaskEditDialog
        open={editDialogOpen}
        task={selectedTask}
        onClose={handleCloseEditDialog}
        onSave={handleTaskSaved}
      />

      <UserSequenceDialog
        open={sequenceDialogOpen}
        onClose={() => setSequenceDialogOpen(false)}
        onSave={async () => {
          try {
            const usersData = await authService.getUsers();
            setUsers(usersData.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)));
            setSnackbar({
              open: true,
              message: 'Sequência atualizada com sucesso',
              severity: 'success'
            });
          } catch (error) {
            console.error('Erro ao recarregar usuários:', error);
            setSnackbar({
              open: true,
              message: 'Erro ao atualizar sequência',
              severity: 'error'
            });
          }
        }}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a tarefa "{taskToDelete?.title}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskList; 