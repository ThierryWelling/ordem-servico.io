export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator';
    sequence?: number;
    profilePicture?: string;
    password?: string;
    username: string;
    tasks?: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    checklist: ChecklistItem[];
}

export interface ServiceOrder {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChecklistItem {
    id: string;
    service_order_id: string;
    description: string;
    text: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface SystemSettings {
    id: string;
    company_name: string;
    logo_path: string;
    primary_color: string;
    secondary_color: string;
    theme_id: string;
    created_at: string;
    updated_at: string;
} 