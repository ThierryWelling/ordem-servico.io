export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence: number;
    companyName: string;
    companyLogo?: string;
    profilePicture: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
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

export interface ServiceOrder {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    assignedToName?: string;
    createdBy: string;
    createdByName?: string;
    checklist: ChecklistItem[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface ChecklistItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    serviceOrderId?: string;
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

export interface Activity {
    id: string;
    type: 'create' | 'update' | 'delete';
    description: string;
    userId: string;
    serviceOrderId: string;
    status: 'pending' | 'completed';
    details?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
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