import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { User, ServiceOrder } from '../../types';
import { userService, serviceOrderService } from '../../services';

interface NewUserForm {
  name: string;
  email: string;
  role: 'admin' | 'collaborator' | 'user';
  sequence?: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    role: 'collaborator'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, ordersData] = await Promise.all([
          userService.getUsers(),
          serviceOrderService.getServiceOrders()
        ]);
        setUsers(usersData);
        setServiceOrders(ordersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setNewUser({
        name: user.name,
        email: user.email,
        role: user.role,
        sequence: user.sequence
      });
    } else {
      setSelectedUser(null);
      setNewUser({
        name: '',
        email: '',
        role: 'collaborator'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'collaborator'
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, newUser);
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso',
          severity: 'success'
        });
      } else {
        await userService.createUser(newUser);
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso',
          severity: 'success'
        });
      }
      const updatedUsers = await userService.getUsers();
      setUsers(updatedUsers);
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar usuário',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Usuário
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
                {users.map(user => {
                  const userTasks = serviceOrders.filter(order => order.assignedTo === user.id);
                  const completedTasks = userTasks.filter(task => task.status === 'completed');
                  const inProgressTasks = userTasks.filter(task => task.status === 'in_progress');

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar alt={user.name}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box ml={2}>{user.name}</Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{userTasks.length}</TableCell>
                      <TableCell>{inProgressTasks.length}</TableCell>
                      <TableCell>{completedTasks.length}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status === 'active' ? 'Ativo' : 'Inativo'}
                          color={user.status === 'active' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nome"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'collaborator' | 'user' }))}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="collaborator">Colaborador</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Sequência"
              type="number"
              fullWidth
              value={newUser.sequence || ''}
              onChange={(e) => setNewUser(prev => ({ ...prev, sequence: parseInt(e.target.value) || undefined }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 