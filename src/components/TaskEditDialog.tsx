import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ServiceOrder, Activity, ChecklistItem } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { serviceOrderService, activityService } from '../services/api';
import { useSnackbar } from 'notistack';
import { RootState } from '../store';
import { v4 as uuidv4 } from 'uuid';
import ActivityList from './ActivityList';

interface TaskEditDialogProps {
  open: boolean;
  task: ServiceOrder | null;
  onClose: () => void;
  onSave: () => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ open, task, onClose, onSave }) => {
  const dispatch = useDispatch();
  const [editedTask, setEditedTask] = useState<ServiceOrder | null>(task);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask || !user) return null;

  const handleStatusChange = async (status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      setLoading(true);
      const updatedTask = {
        ...editedTask,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      };
      await serviceOrderService.updateServiceOrder(editedTask.id, updatedTask);
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      enqueueSnackbar('Erro ao atualizar status', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivityStatusChange = async (activity: Activity, completed: boolean) => {
    try {
      setLoading(true);
      await activityService.updateActivity(activity.id, {
        status: completed ? 'completed' : 'pending',
        completed_at: completed ? new Date().toISOString() : undefined
      });
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      enqueueSnackbar('Erro ao atualizar atividade', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newItemTitle.trim()) return;
    
    try {
      setLoading(true);
      await activityService.createActivity({
        service_order_id: editedTask.id,
        description: newItemTitle.trim(),
        status: 'pending',
        created_by: user.id
      });
      setNewItemTitle('');
      onSave();
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      enqueueSnackbar('Erro ao adicionar atividade', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      setLoading(true);
      await activityService.deleteActivity(activityId);
      onSave();
    } catch (error) {
      console.error('Erro ao remover atividade:', error);
      enqueueSnackbar('Erro ao remover atividade', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = async (activity: Activity) => {
    if (!editingItemText.trim()) return;

    try {
      setLoading(true);
      await activityService.updateActivity(activity.id, {
        description: editingItemText.trim()
      });
      onSave();
      setEditingItemId(null);
      setEditingItemText('');
    } catch (error) {
      console.error('Erro ao editar atividade:', error);
      enqueueSnackbar('Erro ao editar atividade', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;
    
    try {
      setLoading(true);
      const newItem = {
        id: uuidv4(),
        service_order_id: editedTask.id,
        text: newItemTitle.trim(),
        completed: false
      };

      const updatedChecklist = [...(editedTask.checklist || []), newItem];
      const updatedTask = {
        ...editedTask,
        checklist: updatedChecklist
      };

      await serviceOrderService.updateServiceOrder(editedTask.id, updatedTask);
      setEditedTask(updatedTask);
      setNewItemTitle('');
      onSave();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      enqueueSnackbar('Erro ao adicionar item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updatedTask = {
        ...editedTask,
        checklist: editedTask.checklist?.filter(item => item.id !== itemId)
      };

      await serviceOrderService.updateServiceOrder(editedTask.id, updatedTask);
      onSave();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      enqueueSnackbar('Erro ao remover item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (item: ChecklistItem) => {
    if (!editingItemText.trim()) return;

    try {
      setLoading(true);
      const updatedTask = {
        ...editedTask,
        checklist: editedTask.checklist?.map(i =>
          i.id === item.id ? { ...i, text: editingItemText.trim() } : i
        )
      };

      await serviceOrderService.updateServiceOrder(editedTask.id, updatedTask);
      onSave();
      setEditingItemId(null);
      setEditingItemText('');
    } catch (error) {
      console.error('Erro ao editar item:', error);
      enqueueSnackbar('Erro ao editar item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistItemToggle = async (item: ChecklistItem) => {
    try {
      setLoading(true);
      const newCompleted = !item.completed;
      const updatedChecklist = editedTask.checklist?.map(i =>
        i.id === item.id ? { ...i, completed: newCompleted } : i
      ) || [];

      const updatedTask = {
        ...editedTask,
        checklist: updatedChecklist
      };

      await serviceOrderService.updateServiceOrder(editedTask.id, updatedTask);
      setEditedTask(updatedTask);
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      enqueueSnackbar('Erro ao atualizar item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalhes da Tarefa
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {editedTask.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {editedTask.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={editedTask.status === 'pending' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleStatusChange('pending')}
              disabled={loading}
            >
              Pendente
            </Button>
            <Button
              variant={editedTask.status === 'in_progress' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading}
            >
              Em Progresso
            </Button>
            <Button
              variant={editedTask.status === 'completed' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
            >
              Concluída
            </Button>
            <Button
              variant={editedTask.status === 'cancelled' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => handleStatusChange('cancelled')}
              disabled={loading}
            >
              Cancelada
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Checklist
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Adicionar novo item"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddItem}
                disabled={loading || !newItemTitle.trim()}
              >
                Adicionar
              </Button>
            </Box>
            <List>
              {editedTask.checklist?.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <Box>
                      {editingItemId === item.id ? (
                        <>
                          <IconButton
                            edge="end"
                            aria-label="save"
                            onClick={() => handleEditItem(item)}
                            disabled={loading}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="cancel"
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingItemText('');
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditingItemText(item.text);
                            }}
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={Boolean(item.completed)}
                      onChange={() => handleChecklistItemToggle(item)}
                      disabled={loading}
                    />
                  </ListItemIcon>
                  {editingItemId === item.id ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editingItemText}
                      onChange={(e) => setEditingItemText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditItem(item);
                        }
                      }}
                    />
                  ) : (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'text.secondary' : 'text.primary',
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Atividades
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Adicionar nova atividade"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddActivity();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddActivity}
                disabled={loading || !newItemTitle.trim()}
              >
                Adicionar
              </Button>
            </Box>
            <ActivityList
              activities={editedTask.activities || []}
              onStatusChange={handleActivityStatusChange}
              onDelete={handleDeleteActivity}
              onEdit={(activity, newDescription) => handleEditActivity({ ...activity, description: newDescription })}
              loading={loading}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog; 