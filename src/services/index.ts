import api from './api';
import { ServiceOrder, Activity, ChatMessage, Theme, SystemSettings, User } from '../types';

export class AuthService {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async register(userData: Partial<User>): Promise<User> {
    const response = await api.post<User>('/users', userData);
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  async updateUserSequences(users: User[]): Promise<User[]> {
    const response = await api.put<User[]>('/users/sequences', users);
    return response.data;
  }
}

export class ServiceOrderService {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    const response = await api.get<ServiceOrder[]>('/service-orders');
    return response.data;
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder> {
    const response = await api.get<ServiceOrder>(`/service-orders/${id}`);
    return response.data;
  }

  async createServiceOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    try {
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

      if (!serviceOrderData.title || !serviceOrderData.description || !serviceOrderData.created_by || !serviceOrderData.priority) {
        throw new Error('Campos obrigatórios faltando');
      }

      const response = await api.post<ServiceOrder>('/service-orders', serviceOrderData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
      throw error;
    }
  }

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const response = await api.put<ServiceOrder>(`/service-orders/${id}`, data);
    return response.data;
  }

  async deleteServiceOrder(id: string): Promise<void> {
    await api.delete(`/service-orders/${id}`);
  }
}

export class ActivityService {
  async getActivitiesByServiceOrder(serviceOrderId: string): Promise<Activity[]> {
    const response = await api.get<Activity[]>(`/activities/service-order/${serviceOrderId}`);
    return response.data;
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  }

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  }
}

export class ChatService {
  async getConversations(userId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/conversations/${userId}`);
    return response.data;
  }

  async getMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/messages/${userId}/${otherUserId}`);
    return response.data;
  }

  async sendMessage(data: { sender_id: string; receiver_id: string; content: string }): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/chat', data);
    return response.data;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await api.put(`/chat/read/${senderId}/${receiverId}`);
  }
}

export class SettingsService {
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get<SystemSettings>('/settings');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.put<SystemSettings>('/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  async getAllThemes(): Promise<Theme[]> {
    try {
      const response = await api.get<Theme[]>('/settings/themes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
      throw error;
    }
  }

  async createTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
    try {
      const response = await api.post<Theme>('/settings/themes', theme);
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

      const response = await api.post<{ logo_url: string }>('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.logo_url;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export const serviceOrderService = new ServiceOrderService();
export const activityService = new ActivityService();
export const chatService = new ChatService();
export const settingsService = new SettingsService(); 