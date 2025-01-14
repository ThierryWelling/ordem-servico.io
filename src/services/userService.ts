import { User } from '../types';

// Chaves para o localStorage
const USERS_KEY = 'app_users';
const LAST_ID_KEY = 'last_user_id';

// Função para carregar usuários do localStorage
const loadUsers = (): User[] => {
  const storedUsers = localStorage.getItem(USERS_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
};

// Função para salvar usuários no localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Função para gerar próximo ID
const getNextId = (): string => {
  const lastId = parseInt(localStorage.getItem(LAST_ID_KEY) || '0');
  const nextId = lastId + 1;
  localStorage.setItem(LAST_ID_KEY, nextId.toString());
  return `user${nextId}`;
};

// Serviço de usuários
export const userService = {
  // Buscar todos os usuários
  getUsers: async (): Promise<User[]> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    return loadUsers();
  },

  // Buscar usuário por ID
  getUserById: async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = loadUsers();
    return users.find(u => u.id === id) || null;
  },

  // Criar novo usuário
  createUser: async (userData: Omit<User, 'id' | 'tasks'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = loadUsers();
    const newUser: User = {
      ...userData,
      id: getNextId(),
      tasks: [],
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
  },

  // Atualizar usuário existente
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = loadUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = {
      ...users[index],
      ...userData,
    };

    users[index] = updatedUser;
    saveUsers(users);

    return updatedUser;
  },

  // Inicializar banco de dados com dados mockados
  initializeDatabase: async (mockUsers: User[]): Promise<void> => {
    const existingUsers = loadUsers();
    
    if (existingUsers.length === 0) {
      saveUsers(mockUsers);
      
      // Atualiza o último ID usado
      const lastId = mockUsers.reduce((maxId, user) => {
        const id = parseInt(user.id.replace('user', ''));
        return Math.max(maxId, id);
      }, 0);
      
      localStorage.setItem(LAST_ID_KEY, lastId.toString());
    }
  },
};

export default userService; 