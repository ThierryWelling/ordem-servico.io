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
  ListItemSecondaryAction
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, checklist: ChecklistItem[]) => void;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newItem, setNewItem] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      const timestamp = new Date().toISOString();
      const item: ChecklistItem = {
        id: uuidv4(),
        title: newItem.trim(),
        completed: false,
        created_at: timestamp,
        updated_at: timestamp
      };
      setChecklist([...checklist, item]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, description, checklist);
      setTitle('');
      setDescription('');
      setChecklist([]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddItem();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Tarefa</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Título"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box>
            <TextField
              label="Novo Item do Checklist"
              fullWidth
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
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
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!title.trim()}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog; 