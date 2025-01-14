import { User, Task } from '../types';

export const mockUsers: User[] = [
    {
        id: 'user01',
        username: 'thiago',
        name: 'Thiago',
        role: 'Operador',
        sequence: 1,
        password: '123456',
        profilePicture: ''
    },
    {
        id: 'user02',
        username: 'sem',
        name: 'Sem',
        role: 'Supervisor',
        sequence: 2,
        password: '123456',
        profilePicture: ''
    },
    {
        id: 'user03',
        username: 'admin',
        name: 'Admin',
        role: 'admin',
        sequence: 3,
        password: '123456',
        profilePicture: ''
    }
];

export const mockTasks: Task[] = [
    {
        id: 'task1',
        title: 'Verificar equipamentos',
        description: 'Realizar verificação inicial dos equipamentos da linha de produção',
        assignedTo: 'user01',
        currentUser: 'user01',
        status: 'in_progress',
        progress: 60,
        checklist: [
            { id: 'check1', title: 'Verificar temperatura', completed: true },
            { id: 'check2', title: 'Verificar pressão', completed: true },
            { id: 'check3', title: 'Verificar nível de óleo', completed: false },
            { id: 'check4', title: 'Verificar ruídos anormais', completed: false },
            { id: 'check5', title: 'Registrar leituras', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
        id: 'task2',
        title: 'Supervisionar produção',
        description: 'Acompanhar métricas de produção e garantir qualidade',
        assignedTo: 'user02',
        currentUser: 'user02',
        status: 'pending',
        progress: 0,
        checklist: [
            { id: 'check6', title: 'Revisar relatórios', completed: false },
            { id: 'check7', title: 'Avaliar indicadores', completed: false },
            { id: 'check8', title: 'Ajustar parâmetros', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 172800000).toISOString()
    }
]; 