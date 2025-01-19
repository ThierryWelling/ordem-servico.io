import { ServiceOrder, DbServiceOrder, DbChecklistItem } from '../../types';
import { pool } from '../db';
import { convertToCamelCase, convertToSnakeCase } from '../utils';

export const serviceOrdersService = {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    const [rows] = await pool.query('SELECT * FROM service_orders');
    return (rows as DbServiceOrder[]).map(order => convertToCamelCase<ServiceOrder>(order));
  },

  async getServiceOrderById(id: string): Promise<ServiceOrder | null> {
    const [rows] = await pool.query('SELECT * FROM service_orders WHERE id = ?', [id]);
    const orders = rows as DbServiceOrder[];
    if (orders.length === 0) return null;

    const [checklist] = await pool.query(
      'SELECT * FROM checklist_items WHERE service_order_id = ?',
      [id]
    );

    const order = orders[0];
    const dbOrder: DbServiceOrder = {
      ...order,
      checklist: checklist as DbChecklistItem[]
    };

    return convertToCamelCase<ServiceOrder>(dbOrder);
  },

  async createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder> {
    const dbData = convertToSnakeCase<Omit<DbServiceOrder, 'id' | 'created_at' | 'updated_at'>>(data);
    const [result] = await pool.query('INSERT INTO service_orders SET ?', dbData);
    const [newOrder] = await pool.query('SELECT * FROM service_orders WHERE id = ?', [result.insertId]);
    return convertToCamelCase<ServiceOrder>(newOrder[0]);
  },

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const dbData = convertToSnakeCase<Partial<DbServiceOrder>>(data);
    await pool.query('UPDATE service_orders SET ? WHERE id = ?', [dbData, id]);
    const [updatedOrder] = await pool.query('SELECT * FROM service_orders WHERE id = ?', [id]);
    return convertToCamelCase<ServiceOrder>(updatedOrder[0]);
  },

  async deleteServiceOrder(id: string): Promise<void> {
    await pool.query('DELETE FROM service_orders WHERE id = ?', [id]);
  }
}; 