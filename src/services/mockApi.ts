import { User } from '../types';

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        username: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Collaborator User',
        email: 'collaborator@example.com',
        role: 'collaborator',
        username: 'collaborator',
        sequence: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockApi = {
    getUsers: () => Promise.resolve(mockUsers),
    getUserById: (id: string) => Promise.resolve(mockUsers.find(user => user.id === id)),
    createUser: (userData: Partial<User>) => {
        const newUser: User = {
            id: String(mockUsers.length + 1),
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'user',
            username: userData.username || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockUsers.push(newUser);
        return Promise.resolve(newUser);
    },
    updateUser: (id: string, userData: Partial<User>) => {
        const userIndex = mockUsers.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return Promise.reject(new Error('User not found'));
        }
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
        return Promise.resolve(mockUsers[userIndex]);
    }
}; 