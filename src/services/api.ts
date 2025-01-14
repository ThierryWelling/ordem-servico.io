import axios from 'axios';
import { User, ServiceOrder, Activity, ChatMessage } from '../types';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://agenciaalthaia.com.br/api'
    : 'http://localhost:3001/api'
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class AuthService {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async register(userData: Partial<User>): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }
}

export class ServiceOrderService {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    const response = await api.get('/service-orders');
    return response.data;
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder> {
    const response = await api.get(`/service-orders/${id}`);
    return response.data;
  }

  async createServiceOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    try {
      // Garantir que todos os campos obrigatórios estejam presentes e no formato correto
      const serviceOrderData = {
        title: data.title?.trim(),
        description: data.description?.trim(),
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        created_by: data.created_by,
        assigned_to: data.assigned_to,
        checklist: data.checklist?.map(item => ({
          id: item.id,
          service_order_id: item.service_order_id,
          text: item.text.trim(),
          completed: item.completed || false
        })) || []
      };

      // Validar campos obrigatórios
      if (!serviceOrderData.title || !serviceOrderData.description || !serviceOrderData.created_by || !serviceOrderData.priority) {
        throw new Error('Campos obrigatórios faltando');
      }

      console.log('Dados sendo enviados para o servidor:', JSON.stringify(serviceOrderData, null, 2));

      const response = await api.post('/service-orders', serviceOrderData);
      
      console.log('Resposta do servidor:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado ao criar ordem de serviço:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: JSON.stringify(data, null, 2)
      });
      throw error;
    }
  }

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${id}`, data);
    return response.data;
  }

  async deleteServiceOrder(id: string): Promise<void> {
    await api.delete(`/service-orders/${id}`);
  }
}

export class ActivityService {
  async getActivitiesByServiceOrder(serviceOrderId: string): Promise<Activity[]> {
    const response = await api.get(`/activities/service-order/${serviceOrderId}`);
    return response.data;
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await api.post('/activities', data);
    return response.data;
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  }

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  }
}

export class ChatService {
  async getConversations(userId: string): Promise<any[]> {
    const response = await api.get(`/chat/conversations/${userId}`);
    return response.data;
  }

  async getMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/messages/${userId}/${otherUserId}`);
    return response.data;
  }

  async sendMessage(data: { sender_id: string; receiver_id: string; content: string }): Promise<ChatMessage> {
    const response = await api.post('/chat', data);
    return response.data;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await api.put(`/chat/read/${senderId}/${receiverId}`);
  }
}

interface Theme {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    font_size: number;
    border_radius: number;
    is_dark: boolean;
    is_default: boolean;
}

interface SystemSettings {
    id: string;
    company_name: string;
    company_logo_url?: string;
    active_theme_id: string;
    active_theme?: Theme;
}

class SettingsService {
    async getSettings(): Promise<SystemSettings> {
        try {
            const response = await api.get('/settings');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            throw error;
        }
    }

    async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
        try {
            const response = await api.put('/settings', settings);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            throw error;
        }
    }

    async getAllThemes(): Promise<Theme[]> {
        try {
            const response = await api.get('/settings/themes');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar temas:', error);
            throw error;
        }
    }

    async createTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
        try {
            const response = await api.post('/settings/themes', theme);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar tema:', error);
            throw error;
        }
    }

    async uploadLogo(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await api.post('/settings/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upload do logo:', error);
            throw error;
        }
    }
}

export const settingsService = new SettingsService();

export const authService = new AuthService();
export const serviceOrderService = new ServiceOrderService();
export const activityService = new ActivityService();
export const chatService = new ChatService();

export default {
  authService,
  serviceOrderService,
  activityService,
  chatService,
  settingsService,
}; 