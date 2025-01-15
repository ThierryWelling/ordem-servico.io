import axios from 'axios';
import { User } from '../types';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://agenciaalthaia.com.br/api'
  : 'http://localhost:3001/api';

const api = axios.create({ baseURL });

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
}; 