import { v4 as uuidv4 } from 'uuid';
import { ServiceOrder, DbServiceOrder, DbChecklistItem, ChecklistItem } from '../../types';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Tipos para validação
type ServiceOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type ServiceOrderPriority = 'low' | 'medium' | 'high';

// Funções de validação
const isValidStatus = (status: string): status is ServiceOrderStatus => {
    return ['pending', 'in_progress', 'completed', 'cancelled'].includes(status);
};

const isValidPriority = (priority: string): priority is ServiceOrderPriority => {
    return ['low', 'medium', 'high'].includes(priority);
};

const validateServiceOrder = (data: Partial<ServiceOrder>): void => {
    if (data.status && !isValidStatus(data.status)) {
        throw new Error('Status inválido');
    }
    if (data.priority && !isValidPriority(data.priority)) {
        throw new Error('Prioridade inválida');
    }
    if (data.title && data.title.length > 255) {
        throw new Error('Título muito longo');
    }
    if (data.description && data.description.length > 1000) {
        throw new Error('Descrição muito longa');
    }
};

// Funções auxiliares para conversão de caso
const toCamelCase = (str: string): string => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
const toSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertToCamelCase = <T = any>(obj: any): T => {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
        return obj.map(convertToCamelCase) as any;
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);
            acc[camelKey] = convertToCamelCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

const convertToSnakeCase = <T = any>(obj: any): T => {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
        return obj.map(convertToSnakeCase) as any;
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);
            acc[snakeKey] = convertToSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

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
            
            const dbOrder: DbServiceOrder = {
                id: order.id,
                title: order.title,
                description: order.description,
                status: order.status,
                priority: order.priority,
                created_by: order.created_by,
                assigned_to: order.assigned_to,
                created_by_name: order.created_by_name,
                assigned_to_name: order.assigned_to_name,
                created_at: order.created_at,
                updated_at: order.updated_at,
                completed_at: order.completed_at,
                checklist: checklist as DbChecklistItem[]
            };
            
            return convertToCamelCase<ServiceOrder>(dbOrder);
        }));

        return ordersWithChecklist;
    }

    async getServiceOrderById(id: string): Promise<ServiceOrder | null> {
        const [orders] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM service_orders WHERE id = ?',
            [id]
        );

        if (orders.length === 0) {
            return null;
        }

        const [checklist] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM checklist_items WHERE service_order_id = ?',
            [id]
        );

        const order = orders[0];
        const dbOrder: DbServiceOrder = {
            id: order.id,
            title: order.title,
            description: order.description,
            status: order.status,
            priority: order.priority,
            created_by: order.created_by,
            assigned_to: order.assigned_to,
            created_by_name: order.created_by_name,
            assigned_to_name: order.assigned_to_name,
            created_at: order.created_at,
            updated_at: order.updated_at,
            completed_at: order.completed_at,
            checklist: checklist as DbChecklistItem[]
        };

        return convertToCamelCase<ServiceOrder>(dbOrder);
    }

    async createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder> {
        validateServiceOrder(data);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const id = uuidv4();
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const snakeCaseData = convertToSnakeCase<DbServiceOrder>({
                ...data,
                id,
                created_at: timestamp,
                updated_at: timestamp
            });

            // Criar ordem de serviço
            await connection.query<ResultSetHeader>(
                `INSERT INTO service_orders 
                (id, title, description, status, priority, created_by, assigned_to, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    snakeCaseData.title,
                    snakeCaseData.description,
                    snakeCaseData.status || 'pending',
                    snakeCaseData.priority,
                    snakeCaseData.created_by,
                    snakeCaseData.assigned_to,
                    timestamp,
                    timestamp
                ]
            );

            // Criar itens do checklist
            if (data.checklist?.length) {
                const checklistValues = data.checklist.map(item => {
                    const itemId = uuidv4();
                    return [itemId, id, item.title, item.completed, timestamp, timestamp];
                });

                await connection.query<ResultSetHeader>(
                    `INSERT INTO checklist_items 
                    (id, service_order_id, title, completed, created_at, updated_at) 
                    VALUES ?`,
                    [checklistValues]
                );
            }

            await connection.commit();
            const result = await this.getServiceOrderById(id);
            if (!result) {
                throw new Error('Erro ao criar ordem de serviço');
            }
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateServiceOrder(id: string, data: Partial<Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceOrder | null> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const snakeCaseData = convertToSnakeCase<Partial<DbServiceOrder>>(data);
            const updateFields = [];
            const updateValues = [];

            if (snakeCaseData.title) {
                updateFields.push('title = ?');
                updateValues.push(snakeCaseData.title);
            }
            if (snakeCaseData.description) {
                updateFields.push('description = ?');
                updateValues.push(snakeCaseData.description);
            }
            if (snakeCaseData.status) {
                updateFields.push('status = ?');
                updateValues.push(snakeCaseData.status);
            }
            if (snakeCaseData.priority) {
                updateFields.push('priority = ?');
                updateValues.push(snakeCaseData.priority);
            }
            if (snakeCaseData.assigned_to) {
                updateFields.push('assigned_to = ?');
                updateValues.push(snakeCaseData.assigned_to);
            }

            if (updateFields.length > 0) {
                const query = `UPDATE service_orders SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
                await connection.query<ResultSetHeader>(query, [...updateValues, id]);
            }

            // Atualizar checklist se fornecido
            if (data.checklist && Array.isArray(data.checklist)) {
                await connection.query<ResultSetHeader>(
                    'DELETE FROM checklist_items WHERE service_order_id = ?',
                    [id]
                );

                for (const item of data.checklist) {
                    const checklistItemId = uuidv4();
                    const snakeItem = convertToSnakeCase<DbChecklistItem>(item);
                    await connection.query<ResultSetHeader>(
                        'INSERT INTO checklist_items (id, service_order_id, title, completed) VALUES (?, ?, ?, ?)',
                        [checklistItemId, id, snakeItem.title, snakeItem.completed]
                    );
                }
            }

            await connection.commit();
            const result = await this.getServiceOrderById(id);
            return result ? convertToCamelCase<ServiceOrder>(result) : null;
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