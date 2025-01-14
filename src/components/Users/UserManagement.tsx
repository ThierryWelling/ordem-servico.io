import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { User, ServiceOrder } from '../../types';
import { serviceOrderService, authService } from '../../services/api';

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'collaborator';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<ServiceOrder[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'collaborator',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(true);

  // Carrega os usuários e tarefas do banco de dados
  const loadData = async () => {
    try {
      const [usersData, tasksData] = await Promise.all([
        authService.getUsers(),
        serviceOrderService.getServiceOrders()
      ]);
      setUsers(usersData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setNewUser({
        name: user.name,
        email: user.email,
        password: '', // Não carregamos a senha ao editar
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'collaborator',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'collaborator',
    });
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await authService.updateUser(editingUser.id, newUser);
        setSnackbar({
          open: true,
          message: 'Colaborador atualizado com sucesso',
          severity: 'success',
        });
      } else {
        await authService.register(newUser);
        setSnackbar({
          open: true,
          message: 'Colaborador adicionado com sucesso',
          severity: 'success',
        });
      }
      handleCloseDialog();
      loadData(); // Recarrega a lista de usuários
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar colaborador',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gerenciar Colaboradores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Colaborador
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Colaborador</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Tarefas Totais</TableCell>
                  <TableCell>Em Progresso</TableCell>
                  <TableCell>Concluídas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .filter(user => user.role === 'collaborator')
                  .map((user) => {
                    const userTasks = tasks.filter(task => task.assigned_to === user.id);
                    const inProgressTasks = userTasks.filter(task => task.status === 'in_progress');
                    const completedTasks = userTasks.filter(task => task.status === 'completed');

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar alt={user.name}>
                              {user.name[0]}
                            </Avatar>
                            <Typography>{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{userTasks.length}</TableCell>
                        <TableCell>{inProgressTasks.length}</TableCell>
                        <TableCell>{completedTasks.length}</TableCell>
                        <TableCell>
                          <Chip
                            label={inProgressTasks.length > 0 ? 'Ativo' : 'Disponível'}
                            color={inProgressTasks.length > 0 ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => handleOpenDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diálogo para Adicionar/Editar Usuário */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            {!editingUser && (
              <TextField
                label="Senha"
                fullWidth
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={newUser.role}
                label="Função"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'collaborator' })}
              >
                <MenuItem value="collaborator">Colaborador</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password)}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
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
    </Box>
  );
};

export default UserManagement; 