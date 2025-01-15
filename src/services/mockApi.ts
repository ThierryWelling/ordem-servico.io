import { User } from '../types';
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

export default mockApi; 