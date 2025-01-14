import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Box,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfilePicture } from '../store/slices/authSlice';
import { RootState } from '../store';

interface ProfilePictureUploadProps {
  open: boolean;
  onClose: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbar({
          open: true,
          message: 'A imagem deve ter no máximo 5MB',
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      dispatch(updateProfilePicture(previewUrl));
      setSnackbar({
        open: true,
        message: 'Foto de perfil atualizada com sucesso!',
        severity: 'success'
      });
      setTimeout(onClose, 1000);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    dispatch(updateProfilePicture(''));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Atualizar Foto de Perfil</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2,
          py: 2 
        }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={previewUrl || undefined}
              sx={{
                width: 150,
                height: 150,
                border: '3px solid',
                borderColor: 'primary.main',
              }}
            >
              {user?.name?.[0]}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
          />

          <Typography variant="body2" color="text.secondary" align="center">
            Clique no ícone da câmera para selecionar uma nova foto
            <br />
            Tamanho máximo: 5MB
          </Typography>

          {previewUrl && (
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleRemove}
            >
              Remover foto
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!previewUrl}
        >
          Salvar
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProfilePictureUpload; 