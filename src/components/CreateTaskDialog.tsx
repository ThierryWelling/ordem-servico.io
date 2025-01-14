import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { serviceOrderService, authService } from '../services/api';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import { User, ChecklistItem } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialAssignedTo?: string;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onClose, onSave, initialAssignedTo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo || '');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await authService.getUsers();
        setUsers(users.filter(u => u.role === 'collaborator'));
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, enqueueSnackbar]);

  React.useEffect(() => {
    setAssignedTo(initialAssignedTo || '');
  }, [initialAssignedTo]);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      service_order_id: '',
      text: newItemTitle.trim(),
      completed: false,
    };

    setChecklist([...checklist, newItem]);
    setNewItemTitle('');
  };

  const handleDeleteItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };

  const handleEditItem = (item: ChecklistItem) => {
    if (!editingItemText.trim()) return;

    setChecklist(checklist.map(i =>
      i.id === item.id ? { ...i, text: editingItemText.trim() } : i
    ));
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !priority || !user) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      await serviceOrderService.createServiceOrder({
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority,
        created_by: user.id,
        assigned_to: assignedTo || undefined,
        checklist: checklist.map(item => ({
          ...item,
          text: item.text.trim()
        }))
      });

      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setChecklist([]);
      onSave();
      onClose();
      enqueueSnackbar('Tarefa criada com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      enqueueSnackbar('Erro ao criar tarefa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Criar Nova Tarefa</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              label="Prioridade"
            >
              <MenuItem value="low">Baixa</MenuItem>
              <MenuItem value="medium">Média</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Atribuir para</InputLabel>
            <Select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              label="Atribuir para"
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
              {checklist.map((item) => (
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
                      checked={item.completed}
                      onChange={() => {
                        setChecklist(checklist.map(i =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i
                        ));
                      }}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog; 