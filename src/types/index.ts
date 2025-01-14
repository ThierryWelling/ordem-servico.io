export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'collaborator';
    sequence?: number;
    companyName?: string;
    companyLogo?: string;
    profilePicture?: string;
    themePreferences?: {
        primaryColor: string;
        secondaryColor: string;
        fontSize: number;
        borderRadius: number;
    };
    created_at: string;
    updated_at: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    service_order_id: string;
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
    created_at: string;
    updated_at: string;
    completed_at?: string;
    checklist: ChecklistItem[];
}

export interface Activity {
    id: string;
    description: string;
    status: 'pending' | 'completed';
    service_order_id: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export interface Comment {
    id: string;
    text: string;
    service_order_id: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    service_order_id: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface Attachment {
    id: string;
    filename: string;
    filepath: string;
    mimetype: string;
    size: number;
    service_order_id: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface ServiceOrderState {
    orders: ServiceOrder[];
    currentOrder: ServiceOrder | null;
    isLoading: boolean;
    error: string | null;
}

export interface Theme {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    font_size: number;
    border_radius: number;
    is_dark: boolean;
    is_default: boolean;
}

export interface SystemSettings {
    id: string;
    company_name: string;
    company_logo_url?: string;
    active_theme_id: string;
    active_theme?: Theme;
} 