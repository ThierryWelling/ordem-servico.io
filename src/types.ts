export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'collaborator' | 'user';
    sequence?: number;
    username: string;
    profilePicture?: string;
    companyName?: string;
    companyLogo?: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface ServiceOrder {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    created_by: string;
    created_by_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    checklist: ChecklistItem[];
    created_at: string;
    updated_at: string;
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

export interface Activity {
    id: string;
    service_order_id: string;
    user_id: string;
    created_by_name?: string;
    action: string;
    details: string;
    description?: string;
    status?: 'pending' | 'completed';
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    senderId?: string;
    receiver_id: string;
    content: string;
    type?: 'text' | 'image';
    read: boolean;
    created_at: string;
}

export interface Theme {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    font_size?: number;
    border_radius?: number;
    is_dark?: boolean;
    created_at: string;
    updated_at: string;
}

export interface SystemSettings {
    id: string;
    company_name: string;
    company_logo?: string;
    company_logo_url?: string;
    theme_id: string;
    active_theme?: Theme;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    created_by: string;
    created_by_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    checklist: ChecklistItem[];
    created_at: string;
    updated_at: string;
} 