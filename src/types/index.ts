import type { User } from '../types.d';

// Re-exportando todas as interfaces do arquivo types.d.ts
export type {
    User,
    ServiceOrder,
    ChecklistItem,
    Activity,
    Task,
    SystemSettings,
    Comment,
    ChatMessage,
    DbUser,
    DbServiceOrder,
    DbChecklistItem
} from '../types.d';

// Interfaces específicas para gerenciamento de usuários
export interface NewUser {
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence?: number;
    companyName?: string;
    companyLogo?: string;
    profilePicture?: string;
    status: 'active' | 'inactive';
    password: string;
}

export interface UpdateUser {
    name?: string;
    email?: string;
    role?: 'admin' | 'collaborator' | 'user';
    sequence?: number;
    companyName?: string;
    companyLogo?: string;
    profilePicture?: string;
    status?: 'active' | 'inactive';
    password?: string;
}

// Interface para mensagens do chat
export interface ChatProps {
    onSendMessage: () => void;
    user: User;
} 