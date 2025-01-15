import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { Task, ChecklistItem } from '../types';
import { updateTask } from '../store/slices/taskSlice';

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);

  const handleChecklistItemToggle = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].completed = !newChecklist[index].completed;
    setChecklist(newChecklist);

    dispatch(updateTask({
      taskId: task.id,
      checklist: newChecklist,
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          {task.title}
        </Typography>
        <Box>
          <IconButton onClick={onEdit} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={onDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        {task.description}
      </Typography>

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Lista de Verificação
        </Typography>
        <List>
          {checklist.map((item, index) => (
            <ListItem key={item.id} dense>
              <Checkbox
                edge="start"
                checked={item.completed}
                onChange={() => handleChecklistItemToggle(index)}
              />
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box mt={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Status: {task.status}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Prioridade: {task.priority}
        </Typography>
        {task.assigned_to_name && (
          <Typography variant="subtitle2" color="text.secondary">
            Atribuído para: {task.assigned_to_name}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TaskDetail; 