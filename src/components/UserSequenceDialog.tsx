import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

interface UserSequenceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (sequence: number) => void;
  currentSequence: number;
}

const UserSequenceDialog: React.FC<UserSequenceDialogProps> = ({
  open,
  onClose,
  onSave,
  currentSequence,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Atualizar Sequência</DialogTitle>
      <DialogContent>
        {/* Conteúdo do diálogo */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(currentSequence)} color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSequenceDialog; 