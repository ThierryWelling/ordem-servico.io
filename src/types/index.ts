export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence: number;
    company_name?: string;
    company_logo?: string;
    status: 'active' | 'inactive';
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assigned_to?: string;
    created_at: string;
    updated_at: string;
    checklist: ChecklistItem[];
}

export interface ServiceOrder {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assigned_to: string;
    created_by: string;
    checklist: ChecklistItem[];
    created_at: string;
    updated_at: string;
}

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface SystemSettings {
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en-US';
    notifications: boolean;
}

export interface Activity {
    id: string;
    type: 'task_created' | 'task_updated' | 'task_completed';
    description: string;
    user_id: string;
    task_id: string;
    created_at: string;
} 