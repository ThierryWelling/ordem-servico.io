import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
  Box,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Activity } from '../types';

interface ActivityListProps {
  activities: Activity[];
  onStatusChange?: (activity: Activity, completed: boolean) => void;
  onDelete?: (activityId: string) => void;
  onEdit?: (activity: Activity, newDescription: string) => void;
  loading?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onStatusChange,
  onDelete,
  onEdit,
  loading = false,
}) => {
  const [editingActivityId, setEditingActivityId] = React.useState<string | null>(null);
  const [editingActivityText, setEditingActivityText] = React.useState('');

  const handleStartEdit = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setEditingActivityText(activity.description);
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditingActivityText('');
  };

  const handleSaveEdit = (activity: Activity) => {
    if (onEdit && editingActivityText.trim()) {
      onEdit(activity, editingActivityText.trim());
    }
    handleCancelEdit();
  };

  return (
    <List>
      {activities.map((activity) => (
        <ListItem key={activity.id}>
          {onStatusChange && (
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={activity.status === 'completed'}
                onChange={() => onStatusChange(activity, activity.status !== 'completed')}
                disabled={loading}
              />
            </ListItemIcon>
          )}
          {editingActivityId === activity.id ? (
            <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={editingActivityText}
                onChange={(e) => setEditingActivityText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(activity);
                  }
                }}
              />
              <IconButton
                edge="end"
                aria-label="save"
                onClick={() => handleSaveEdit(activity)}
                disabled={loading}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="cancel"
                onClick={handleCancelEdit}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <ListItemText
                primary={activity.description}
                secondary={`Criado por: ${activity.created_by_name || 'Desconhecido'}`}
                sx={{
                  textDecoration: activity.status === 'completed' ? 'line-through' : 'none',
                  color: activity.status === 'completed' ? 'text.secondary' : 'text.primary',
                }}
              />
              {(onEdit || onDelete) && (
                <ListItemSecondaryAction>
                  {onEdit && (
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleStartEdit(activity)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDelete(activity.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              )}
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default ActivityList; 