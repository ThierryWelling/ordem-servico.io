import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Paper,
} from '@mui/material';
import { Task, ChecklistItem } from '../types';
import { taskService } from '../services';

interface TaskDetailProps {
  taskId: string;
  onUpdate: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onUpdate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTask(taskId);
        setTask(data);
      } catch (error) {
        console.error('Erro ao carregar tarefa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  const handleChecklistItemToggle = async (item: ChecklistItem) => {
    if (!task) return;

    try {
      const updatedChecklist = task.checklist.map(checkItem =>
        checkItem.id === item.id
          ? { ...checkItem, completed: !checkItem.completed }
          : checkItem
      );

      const updatedTask = { ...task, checklist: updatedChecklist };
      await taskService.updateTask(task.id, updatedTask);
      setTask(updatedTask);
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar item da checklist:', error);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (!task) {
    return <Typography>Tarefa não encontrada</Typography>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {task.title}
      </Typography>

      <Typography variant="body1" paragraph>
        {task.description}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Checklist
        </Typography>
        <List>
          {task.checklist.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => handleChecklistItemToggle(item)}
            >
              <Checkbox checked={item.completed} />
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default TaskDetail; 