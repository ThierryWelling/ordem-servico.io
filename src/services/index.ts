import api from './api';
import { Task, ServiceOrder, SystemSettings, User, Activity } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserSequences: async (users: User[]): Promise<void> => {
    await api.put('/users/sequences', { users });
  }
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

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
  },

  getServiceOrder: async (id: string): Promise<ServiceOrder> => {
    const response = await api.get(`/service-orders/${id}`);
    return response.data;
  },

  createServiceOrder: async (serviceOrder: Partial<ServiceOrder>): Promise<ServiceOrder> => {
    const response = await api.post('/service-orders', serviceOrder);
    return response.data;
  },

  updateServiceOrder: async (id: string, serviceOrder: Partial<ServiceOrder>): Promise<ServiceOrder> => {
    const response = await api.put(`/service-orders/${id}`, serviceOrder);
    return response.data;
  },

  deleteServiceOrder: async (id: string): Promise<void> => {
    await api.delete(`/service-orders/${id}`);
  }
};

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put('/settings', settings);
    return response.data;
  }
};

export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get('/activities');
    return response.data;
  },

  createActivity: async (activity: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', activity);
    return response.data;
  }
}; 