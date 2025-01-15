import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task, ChecklistItem } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const now = new Date().toISOString();
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        service_order_id: '',
        description: newChecklistItem,
        text: newChecklistItem,
        completed: false,
        created_at: now,
        updated_at: now,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist.splice(index, 1);
    setChecklist(newChecklist);
  };

  const handleSave = () => {
    const newTask: Partial<Task> = {
      title,
      description,
      checklist,
      status: 'pending',
      priority: 'medium',
    };
    onSave(newTask);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setNewChecklistItem('');
    setChecklist([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Tarefa</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
          <Box>
            <TextField
              label="Item da Lista"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              fullWidth
            />
          </Box>
          <List>
            {checklist.map((item, index) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveChecklistItem(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim() || !description.trim()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog; 