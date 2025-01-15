import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ServiceOrder, ChecklistItem } from '../types';
import api from '../services/api';

interface TaskEditDialogProps {
  open: boolean;
  onClose: () => void;
  task: ServiceOrder;
  onTaskUpdated: () => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  onClose,
  task,
  onTaskUpdated
}) => {
  const [editedTask, setEditedTask] = useState<ServiceOrder>(task);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      setLoading(true);
      const newItem: ChecklistItem = {
        id: uuidv4(),
        service_order_id: editedTask.id,
        text: newItemTitle.trim(),
        description: newItemTitle.trim(),
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedChecklist = [...(editedTask.checklist || []), newItem];

      await api.put(`/service-orders/${editedTask.id}`, {
        ...editedTask,
        checklist: updatedChecklist
      });

      setEditedTask(prev => ({
        ...prev,
        checklist: updatedChecklist
      }));

      setNewItemTitle('');
      onTaskUpdated();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updatedChecklist = editedTask.checklist?.filter(item => item.id !== itemId) || [];

      await api.put(`/service-orders/${editedTask.id}`, {
        ...editedTask,
        checklist: updatedChecklist
      });

      setEditedTask(prev => ({
        ...prev,
        checklist: updatedChecklist
      }));

      onTaskUpdated();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updatedChecklist = editedTask.checklist?.map(item => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      }) || [];

      await api.put(`/service-orders/${editedTask.id}`, {
        ...editedTask,
        checklist: updatedChecklist
      });

      setEditedTask(prev => ({
        ...prev,
        checklist: updatedChecklist
      }));

      onTaskUpdated();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewItemTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Editar Checklist</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Novo Item"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddItem} disabled={!newItemTitle.trim()}>
                      <AddIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <List>
              {editedTask.checklist?.map((item) => (
                <ListItem
                  key={item.id}
                  dense
                  button
                  onClick={() => handleToggleItem(item.id)}
                >
                  <ListItemText
                    primary={item.text}
                    style={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'gray' : 'inherit'
                    }}
                  />
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog; 