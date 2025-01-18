import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, checklist: Omit<ChecklistItem, 'serviceOrderId'>[]) => Promise<void>;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  checklist?: string;
}

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_CHECKLIST_ITEMS = 20;
const MAX_CHECKLIST_ITEM_LENGTH = 255;

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newItem, setNewItem] = useState('');
  const [checklist, setChecklist] = useState<Omit<ChecklistItem, 'serviceOrderId'>[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `O título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres`;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`;
    }

    if (checklist.length > MAX_CHECKLIST_ITEMS) {
      newErrors.checklist = `A lista pode ter no máximo ${MAX_CHECKLIST_ITEMS} itens`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    if (newItem.length > MAX_CHECKLIST_ITEM_LENGTH) {
      setErrors(prev => ({
        ...prev,
        checklist: `O item deve ter no máximo ${MAX_CHECKLIST_ITEM_LENGTH} caracteres`
      }));
      return;
    }

    if (checklist.length >= MAX_CHECKLIST_ITEMS) {
      setErrors(prev => ({
        ...prev,
        checklist: `A lista pode ter no máximo ${MAX_CHECKLIST_ITEMS} itens`
      }));
      return;
    }

    const timestamp = new Date().toISOString();
    const item: Omit<ChecklistItem, 'serviceOrderId'> = {
      id: uuidv4(),
      title: newItem.trim(),
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    setChecklist([...checklist, item]);
    setNewItem('');
    setErrors(prev => ({ ...prev, checklist: undefined }));
  };

  const handleRemoveItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
    setErrors(prev => ({ ...prev, checklist: undefined }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(title, description, checklist);
      setTitle('');
      setDescription('');
      setChecklist([]);
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao criar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddItem();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '50vh' }
      }}
    >
      <DialogTitle>Nova Tarefa</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <TextField
            label="Título"
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors(prev => ({ ...prev, title: undefined }));
            }}
            error={!!errors.title}
            helperText={errors.title}
            required
          />

          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors(prev => ({ ...prev, description: undefined }));
            }}
            error={!!errors.description}
            helperText={errors.description}
          />

          <Box>
            <TextField
              label="Novo Item do Checklist"
              fullWidth
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!errors.checklist}
              helperText={errors.checklist}
            />
          </Box>

          <List>
            {checklist.map((item) => (
              <ListItem key={item.id}>
                <ListItemText primary={item.title} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog; 