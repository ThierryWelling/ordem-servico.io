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
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onTaskCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/service-orders', {
        title: title.trim(),
        description: description.trim(),
        status: 'pending'
      });

      setTitle('');
      setDescription('');
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      setError('Erro ao criar tarefa. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Nova Tarefa</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
                error={!!error && !title.trim()}
              />
              <TextField
                fullWidth
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                required
                multiline
                rows={4}
                error={!!error && !description.trim()}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !title.trim() || !description.trim()}
          >
            Criar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTaskDialog; 