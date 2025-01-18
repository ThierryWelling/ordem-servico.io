import { Multer } from 'multer';

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
        }
    }
}

// Interface para dados do banco (snake_case)
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
}

export {}; 