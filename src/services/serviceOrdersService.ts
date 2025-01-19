import api from './api';
import { ServiceOrder } from '../types';

const serviceOrdersService = {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    // Simula uma chamada à API
    return [];
  },

  async getServiceOrderById(id: string): Promise<ServiceOrder | null> {
    // Simula uma chamada à API
    return null;
  },

  async createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder> {
    // Simula uma chamada à API
    return {
      id: '1',
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: data.checklist || []
    };
  },

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    // Simula uma chamada à API
    return {
      id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || '',
      createdBy: data.createdBy || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: data.checklist || []
    };
  },

  async deleteServiceOrder(id: string): Promise<void> {
    // Simula uma chamada à API
  },

  getUserServiceOrders: async (userId: string) => {
    const response = await api.get('/service-orders');
    return response.data.filter((order: ServiceOrder) => order.assignedTo === userId);
  },

  // ... existing code ...
};

export default serviceOrdersService; 