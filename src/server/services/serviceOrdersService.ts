import { ServiceOrder } from '../../types';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

class ServiceOrdersService {
    async getAllServiceOrders(): Promise<ServiceOrder[]> {
        const [orders] = await pool.query<RowDataPacket[]>(`
            SELECT so.*, 
                   u1.name as created_by_name,
                   u2.name as assigned_to_name
            FROM service_orders so
            LEFT JOIN users u1 ON so.created_by = u1.id
            LEFT JOIN users u2 ON so.assigned_to = u2.id
        `);

        // Buscar checklist para cada ordem de serviço
        const ordersWithChecklist = await Promise.all(orders.map(async (order) => {
            const [checklist] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM checklist_items WHERE service_order_id = ?',
                [order.id]
            );
            return { ...order, checklist };
        }));

        return ordersWithChecklist as ServiceOrder[];
    }

    async getServiceOrderById(id: string): Promise<ServiceOrder | null> {
        const [orders] = await pool.query<RowDataPacket[]>(`
            SELECT so.*, 
                   u1.name as created_by_name,
                   u2.name as assigned_to_name
            FROM service_orders so
            LEFT JOIN users u1 ON so.created_by = u1.id
            LEFT JOIN users u2 ON so.assigned_to = u2.id
            WHERE so.id = ?`,
            [id]
        );

        if (orders.length === 0) {
            return null;
        }

        const [checklist] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM checklist_items WHERE service_order_id = ?',
            [id]
        );

        return { ...orders[0], checklist } as ServiceOrder;
    }

    async createServiceOrder(data: Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceOrder> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const id = uuidv4();
            const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Criar ordem de serviço
            await connection.query<ResultSetHeader>(
                `INSERT INTO service_orders 
                (id, title, description, status, priority, created_by, assigned_to, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    data.title,
                    data.description,
                    data.status || 'pending',
                    data.priority,
                    data.created_by,
                    data.assigned_to,
                    created_at
                ]
            );

            // Criar itens do checklist
            if (data.checklist && Array.isArray(data.checklist)) {
                for (const item of data.checklist) {
                    const checklistItemId = uuidv4();
                    await connection.query<ResultSetHeader>(
                        'INSERT INTO checklist_items (id, service_order_id, description, completed) VALUES (?, ?, ?, ?)',
                        [checklistItemId, id, item.description, item.completed]
                    );
                }
            }

            await connection.commit();

            return this.getServiceOrderById(id) as Promise<ServiceOrder>;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateServiceOrder(id: string, data: Partial<Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at'>>): Promise<ServiceOrder | null> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Atualizar ordem de serviço
            const updateFields = [];
            const updateValues = [];

            if (data.title) {
                updateFields.push('title = ?');
                updateValues.push(data.title);
            }
            if (data.description) {
                updateFields.push('description = ?');
                updateValues.push(data.description);
            }
            if (data.status) {
                updateFields.push('status = ?');
                updateValues.push(data.status);
            }
            if (data.priority) {
                updateFields.push('priority = ?');
                updateValues.push(data.priority);
            }
            if (data.assigned_to) {
                updateFields.push('assigned_to = ?');
                updateValues.push(data.assigned_to);
            }

            if (updateFields.length > 0) {
                const query = `UPDATE service_orders SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
                await connection.query<ResultSetHeader>(query, [...updateValues, id]);
            }

            // Atualizar checklist se fornecido
            if (data.checklist && Array.isArray(data.checklist)) {
                // Remover itens existentes
                await connection.query<ResultSetHeader>(
                    'DELETE FROM checklist_items WHERE service_order_id = ?',
                    [id]
                );

                // Adicionar novos itens
                for (const item of data.checklist) {
                    const checklistItemId = uuidv4();
                    await connection.query<ResultSetHeader>(
                        'INSERT INTO checklist_items (id, service_order_id, description, completed) VALUES (?, ?, ?, ?)',
                        [checklistItemId, id, item.description, item.completed]
                    );
                }
            }

            await connection.commit();

            return this.getServiceOrderById(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteServiceOrder(id: string): Promise<boolean> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Excluir itens do checklist
            await connection.query<ResultSetHeader>(
                'DELETE FROM checklist_items WHERE service_order_id = ?',
                [id]
            );

            // Excluir ordem de serviço
            const [result] = await connection.query<ResultSetHeader>(
                'DELETE FROM service_orders WHERE id = ?',
                [id]
            );

            await connection.commit();

            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new ServiceOrdersService(); 