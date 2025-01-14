import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Divider,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import UserDashboard from './UserDashboard';
import TaskList from '../TaskList';

const CollaboratorDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  if (!userId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Colaborador não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Voltar
        </Button>

        <Typography variant="h4" sx={{ mb: 4 }}>
          Painel do Colaborador
        </Typography>

        {/* Dashboard do Colaborador */}
        <Box sx={{ mb: 4 }}>
          <UserDashboard userId={userId} isAdminView={true} />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Lista de Atividades do Colaborador */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Atividades do Colaborador
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                // O TaskList já tem a lógica de criar tarefa, então vamos apenas passar o prop
                // que indica que queremos mostrar o diálogo de criação
                document.dispatchEvent(new CustomEvent('createTask', { detail: { assignedTo: userId } }));
              }}
            >
              Nova Tarefa
            </Button>
          </Box>
          <TaskList collaboratorId={userId} isAdminView={true} />
        </Box>
      </Box>
    </Container>
  );
};

export default CollaboratorDetails; 