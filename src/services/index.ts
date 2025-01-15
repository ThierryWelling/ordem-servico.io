import api from './api';
import { Task, ServiceOrder, SystemSettings } from '../types';

export const taskService = {
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  }
};

export const serviceOrderService = {
  getServiceOrders: async (): Promise<ServiceOrder[]> => {
    const response = await api.get('/service-orders');
    return response.data;
  }
};

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get('/settings');
    return response.data;
  }
}; 