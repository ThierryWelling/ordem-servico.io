import { User } from '../types';

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'collaborator',
        sequence: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
        sequence: 2,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]; 