import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { User } from '../types';
import api from '../services/api';

interface UserSequenceDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  onUpdateSequences: (updatedUsers: User[]) => void;
}

const UserSequenceDialog: React.FC<UserSequenceDialogProps> = ({
  open,
  onClose,
  users,
  onUpdateSequences
}) => {
  const [orderedUsers, setOrderedUsers] = useState<User[]>(
    users
      .filter(user => user.role === 'collaborator')
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  );

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedUsers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedUsers = items.map((user, index) => ({
      ...user,
      sequence: index + 1
    }));

    setOrderedUsers(updatedUsers);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        orderedUsers.map((user, index) =>
          api.put(`/users/${user.id}/sequence`, { sequence: index + 1 })
        )
      );
      onUpdateSequences(orderedUsers);
      onClose();
    } catch (error) {
      console.error('Error updating user sequences:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ordenar Sequência de Usuários</DialogTitle>
      <DialogContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="users">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {orderedUsers.map((user, index) => (
                  <Draggable key={user.id} draggableId={user.id} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <IconButton size="small">
                          <DragIndicatorIcon />
                        </IconButton>
                        <ListItemText primary={user.name} secondary={`Sequência: ${index + 1}`} />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSequenceDialog; 