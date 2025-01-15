import { User } from '../types';

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        role: 'collaborator',
        sequence: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Maria Santos',
        username: 'maria.santos',
        email: 'maria@example.com',
        role: 'admin',
        sequence: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]; 