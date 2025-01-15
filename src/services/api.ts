import axios, { AxiosInstance } from 'axios';

interface CustomAPI extends AxiosInstance {
  getUsers: () => Promise<any[]>;
  getServiceOrders: () => Promise<any[]>;
}

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://agenciaalthaia.com.br/api'
    : 'http://localhost:3001/api'
}) as CustomAPI;

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Adiciona métodos auxiliares à instância da API
api.getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

api.getServiceOrders = async () => {
  const response = await api.get('/service-orders');
  return response.data;
};

export default api; 