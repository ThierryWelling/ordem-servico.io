import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  IconButton,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { User } from '../types';
import { authService } from '../services/api';
import { useSnackbar } from 'notistack';

interface UserSequenceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UserSequenceDialog: React.FC<UserSequenceDialogProps> = ({ open, onClose, onSave }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await authService.getUsers();
        setUsers(usersData
          .filter(user => user.role === 'collaborator')
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        );
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, enqueueSnackbar]);

  const handleUpdateSequence = async (userId: string, sequence: number) => {
    try {
      setLoading(true);
      await authService.updateUser(userId, { sequence });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, sequence } : user
        ).sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      );

      enqueueSnackbar('Sequência atualizada com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar sequência:', error);
      enqueueSnackbar('Erro ao atualizar sequência', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Atualiza todos os usuários com suas sequências atuais
      await Promise.all(
        users.map((user, index) => 
          authService.updateUser(user.id, { sequence: index + 1 })
        )
      );
      onSave();
      onClose();
      enqueueSnackbar('Sequências salvas com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao salvar sequências:', error);
      enqueueSnackbar('Erro ao salvar sequências', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const moveUser = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === users.length - 1)
    ) return;

    const newUsers = [...users];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newUsers[index], newUsers[targetIndex]] = [newUsers[targetIndex], newUsers[index]];
    
    // Atualiza as sequências
    newUsers.forEach((user, i) => {
      user.sequence = i + 1;
    });
    
    setUsers(newUsers);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerenciar Sequência de Colaboradores</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Defina a ordem dos colaboradores. O nível 1 só poderá enviar tarefas para o nível 2, 
            e assim sucessivamente.
          </Typography>
        </Box>
        
        <List>
          {users.map((user, index) => (
            <ListItem key={user.id}>
              <ListItemText
                primary={user.name}
                secondary={`Nível ${user.sequence || 'Não definido'}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  disabled={index === 0 || loading}
                  onClick={() => moveUser(index, 'up')}
                >
                  <ArrowUpIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  disabled={index === users.length - 1 || loading}
                  onClick={() => moveUser(index, 'down')}
                >
                  <ArrowDownIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
          startIcon={<SaveIcon />}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSequenceDialog; 