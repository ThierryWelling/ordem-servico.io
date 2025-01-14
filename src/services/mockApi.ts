import { mockUsers, mockTasks } from '../mock/data';
import { User, Task } from '../types';

// Simula um delay na resposta
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
    login: async (username: string, password: string) => {
        await delay(500); // Simula delay da rede

        const user = mockUsers.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }

        // Remove a senha antes de retornar o usuário
        const { password: _, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            token: 'mock-jwt-token'
        };
    },
    logout: async () => {
        await delay(200);
        return true;
    },
};

export const mockTaskService = {
    getTasks: async () => {
        await delay(500);
        return mockTasks;
    },
    
    updateTask: async (taskId: string, updates: Partial<Task>) => {
        await delay(300);
        const taskIndex = mockTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Tarefa não encontrada');
        }
        mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
        return mockTasks[taskIndex];
    },
    
    moveTask: async (taskId: string, destinationUserId: string) => {
        await delay(300);
        const taskIndex = mockTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Tarefa não encontrada');
        }
        mockTasks[taskIndex] = {
            ...mockTasks[taskIndex],
            assignedTo: destinationUserId,
            currentUser: destinationUserId,
            updatedAt: new Date().toISOString(),
        };
        return mockTasks[taskIndex];
    },
}; 