import api from './api';
import { ServiceOrder } from '../types';

export const serviceOrderService = {
  getServiceOrders: async () => {
    const response = await api.get('/service-orders');
    return response.data;
  },

  getUserServiceOrders: async (userId: string) => {
    const response = await api.get('/service-orders');
    return response.data.filter((order: ServiceOrder) => order.assigned_to === userId);
  },

  // ... existing code ...
}; 