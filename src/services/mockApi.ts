import { User, Task } from '../types';
import { mockUsers } from '../mock/data';
import { v4 as uuidv4 } from 'uuid';

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
        assignedTo: 'user1',
        createdBy: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checklist: []
    }
];

export default mockApi; 