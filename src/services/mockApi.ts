import { User, Task } from '../types';
import { mockUsers } from '../mock/data';

const mockApi = {
  login: async (email: string, password: string): Promise<User | null> => {
    const user = mockUsers.find(u => u.email === email);
    if (!user) return null;
    return user;
  },

  getUsers: async (): Promise<User[]> => {
    return mockUsers;
  }
};

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Tarefa 1',
        description: 'Descrição da tarefa 1',
        status: 'pending',
        priority: 'high',
        assigned_to: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        checklist: []
    }
];

export default mockApi; 