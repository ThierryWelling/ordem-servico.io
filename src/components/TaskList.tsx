import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
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
import { ServiceOrder, User } from '../types';
import { serviceOrderService, authService } from '../services';
import TaskEditDialog from './TaskEditDialog';
import CreateTaskDialog from './CreateTaskDialog';
import UserSequenceDialog from './UserSequenceDialog';

interface TaskListProps {
  collaboratorId?: string;
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

const TaskList: React.FC<TaskListProps> = ({ collaboratorId }) => {
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
      const filteredUsers = users.filter((u: User) => u.id === collaboratorId);
      return filteredUsers.length > 0 ? filteredUsers : [];
    }
    
    if (isAdmin) {
      return users.filter((u: User) => u.role === 'collaborator');
    }
    
    const currentUser = users.find((u: User) => u.id === user.id);
    if (!currentUser || !currentUser.sequence) return [currentUser].filter(Boolean);
    
    const nextUser = users.find((u: User) => u.sequence === (currentUser.sequence || 0) + 1);
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetUserId: string) => {
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
          ? tasksData.filter((task: ServiceOrder) => task.assigned_to === collaboratorId)
          : tasksData;

        setTasks(filteredTasks);
        setUsers(usersData.sort((a: User, b: User) => ((a.sequence || 0) - (b.sequence || 0))));
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeleteClick = (task: ServiceOrder, event: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleEditTask = (task: ServiceOrder) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSaved = async () => {
    try {
      const updatedTasks = await serviceOrderService.getServiceOrders();
      setTasks(updatedTasks);
      setSnackbar({
        open: true,
        message: 'Tarefa atualizada com sucesso',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar lista de tarefas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar lista de tarefas',
        severity: 'error'
      });
    }
  };

  const handleUpdateSequences = async (updatedUsers: User[]) => {
    try {
      const result = await authService.updateUserSequences(updatedUsers);
      if (result) {
        setSnackbar({
          open: true,
          message: 'Sequência atualizada com sucesso',
          severity: 'success'
        });
        setUsers(result);
      }
    } catch (error) {
      console.error('Erro ao atualizar sequência:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar sequência',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const visibleUsers = getVisibleUsers().filter((user): user is User => user !== undefined);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tarefas
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateTaskDialogOpen(true)}
          >
            Nova Tarefa
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {visibleUsers.map((visibleUser: User) => (
          <Box
            key={visibleUser.id}
            sx={{ mb: 4 }}
          >
            <Box
              sx={{ p: 2 }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, visibleUser.id)}
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {visibleUser.name[0]}
              </Avatar>
              <Typography variant="h6" sx={{ ml: 2 }}>
                {visibleUser.name}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              {tasks
                .filter(task => task.assigned_to === visibleUser.id)
                .map(task => (
                  <Card
                    key={task.id}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleEditTask(task)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {task.title}
                        </Typography>
                        <Box>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {isAdmin && (
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteClick(task, e)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        {task.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          icon={getStatusIcon(task.status)}
                          label={task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>

            {tasks.filter(task => task.assigned_to === visibleUser.id).length === 0 && (
              <Typography color="textSecondary" align="center">
                Nenhuma tarefa atribuída
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {selectedTask && (
        <TaskEditDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          task={selectedTask}
          onTaskUpdated={handleTaskSaved}
        />
      )}

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        onSave={handleTaskSaved}
      />

      <UserSequenceDialog
        open={sequenceDialogOpen}
        onClose={() => setSequenceDialogOpen(false)}
        users={users}
        onUpdateSequences={handleUpdateSequences}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta tarefa?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskList; 