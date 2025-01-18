import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { User } from '../types';

interface UserSequenceDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  onUpdateSequences: (updatedUsers: User[]) => Promise<void>;
}

const UserSequenceDialog: React.FC<UserSequenceDialogProps> = ({
  open,
  onClose,
  users,
  onUpdateSequences
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Atualizar Sequência</DialogTitle>
      <DialogContent>
        {/* Conteúdo do diálogo */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onUpdateSequences(users)} color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSequenceDialog; 