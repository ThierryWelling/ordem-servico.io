// Interface para dados do banco (snake_case)
export interface DbUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence?: number;
    company_name?: string;
    company_logo?: string;
    profile_picture?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    password_hash: string;
}

export interface DbChecklistItem {
    id: string;
    service_order_id: string;
    title: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbServiceOrder {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    created_by: string;
    assigned_to?: string;
    created_by_name?: string;
    assigned_to_name?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    checklist?: DbChecklistItem[];
}

// Interface para frontend (camelCase)
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence?: number;
    companyName?: string;
    companyLogo?: string;
    profilePicture?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

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

export interface ChecklistItem {
    id: string;
    serviceOrderId: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceOrder {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    createdBy: string;
    assignedTo?: string;
    createdByName?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    checklist?: ChecklistItem[];
}

export interface Activity {
    id: string;
    serviceOrderId: string;
    description: string;
    status: 'pending' | 'completed';
    createdBy: string;
    createdByName?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    type?: 'create' | 'update' | 'delete';
    details?: Record<string, unknown>;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    checklist: ChecklistItem[];
}

export interface SystemSettings {
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en-US';
    notifications: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    logoPath: string;
    companyName: string;
}

export interface Comment {
    id: string;
    text: string;
    userId: string;
    serviceOrderId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    updatedAt: string;
    read: boolean;
}

export interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: () => void;
    user: User;
} 