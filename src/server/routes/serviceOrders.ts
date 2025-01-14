import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Buscar todas as ordens de serviço
router.get('/', async (req, res) => {
    try {
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

        res.json(ordersWithChecklist);
    } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar ordens de serviço por usuário
router.get('/user/:userId', async (req, res) => {
    try {
        const [orders] = await pool.query<RowDataPacket[]>(
            `SELECT so.*, 
                    u1.name as created_by_name,
                    u2.name as assigned_to_name
             FROM service_orders so
             LEFT JOIN users u1 ON so.created_by = u1.id
             LEFT JOIN users u2 ON so.assigned_to = u2.id
             WHERE so.created_by = ? OR so.assigned_to = ?`,
            [req.params.userId, req.params.userId]
        );
        res.json(orders);
    } catch (error) {
        console.error('Erro ao buscar ordens de serviço do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar ordem de serviço por ID
router.get('/:id', async (req, res) => {
    try {
        const [orders] = await pool.query<RowDataPacket[]>(
            `SELECT so.*, 
                    u1.name as created_by_name,
                    u2.name as assigned_to_name
             FROM service_orders so
             LEFT JOIN users u1 ON so.created_by = u1.id
             LEFT JOIN users u2 ON so.assigned_to = u2.id
             WHERE so.id = ?`,
            [req.params.id]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        
        res.json(orders[0]);
    } catch (error) {
        console.error('Erro ao buscar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Criar nova ordem de serviço
router.post('/', async (req, res) => {
    const { title, description, status, priority, created_by, assigned_to, checklist } = req.body;
    
    try {
        console.log('Recebendo requisição POST /service-orders:', JSON.stringify({
            title,
            description,
            status,
            priority,
            created_by,
            assigned_to,
            checklist
        }, null, 2));

        // Validar campos obrigatórios
        if (!title?.trim() || !priority || !created_by) {
            const error = {
                message: 'Campos obrigatórios não preenchidos',
                details: {
                    title: !title?.trim() ? 'Título é obrigatório' : null,
                    priority: !priority ? 'Prioridade é obrigatória' : null,
                    created_by: !created_by ? 'Criador é obrigatório' : null
                }
            };
            console.log('Erro de validação:', error);
            return res.status(400).json(error);
        }

        // Validar usuário criador
        const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [created_by]);
        if (users.length === 0) {
            const error = {
                message: 'Usuário criador não encontrado',
                details: { created_by }
            };
            console.log('Erro de validação:', error);
            return res.status(400).json(error);
        }

        // Validar usuário atribuído se fornecido
        if (assigned_to) {
            const [assignedUsers] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [assigned_to]);
            if (assignedUsers.length === 0) {
                const error = {
                    message: 'Usuário atribuído não encontrado',
                    details: { assigned_to }
                };
                console.log('Erro de validação:', error);
                return res.status(400).json(error);
            }
        }

        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados obtida');
    
        try {
            await connection.beginTransaction();
            console.log('Transação iniciada');
            
            const id = uuidv4();
            const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            // Criar ordem de serviço
            const insertOrderQuery = `INSERT INTO service_orders 
                (id, title, description, status, priority, created_by, assigned_to, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertOrderParams = [
                id,
                title.trim(),
                description?.trim() || '',
                status || 'pending',
                priority,
                created_by,
                assigned_to,
                created_at
            ];
            console.log('Executando query de inserção da ordem:', {
                query: insertOrderQuery,
                params: insertOrderParams
            });

            await connection.query(insertOrderQuery, insertOrderParams);
            console.log('Ordem de serviço criada com ID:', id);

            // Criar itens do checklist se fornecidos
            if (checklist && Array.isArray(checklist)) {
                console.log('Criando itens do checklist:', JSON.stringify(checklist, null, 2));
                
                for (const item of checklist) {
                    if (!item.text?.trim()) {
                        throw new Error('Item do checklist sem texto');
                    }

                    const checklistItemId = uuidv4();
                    const insertItemQuery = 'INSERT INTO checklist_items (id, service_order_id, text, completed) VALUES (?, ?, ?, ?)';
                    const insertItemParams = [checklistItemId, id, item.text.trim(), Boolean(item.completed)];
                    
                    console.log('Executando query de inserção do item:', {
                        query: insertItemQuery,
                        params: insertItemParams
                    });

                    await connection.query(insertItemQuery, insertItemParams);
                    console.log('Item do checklist criado:', {
                        id: checklistItemId,
                        service_order_id: id,
                        text: item.text.trim(),
                        completed: item.completed || false
                    });
                }
            }

            await connection.commit();
            console.log('Transação commitada com sucesso');

            // Buscar a ordem de serviço recém-criada com os nomes dos usuários e checklist
            const selectOrderQuery = `SELECT so.*, 
                    u1.name as created_by_name,
                    u2.name as assigned_to_name
             FROM service_orders so
             LEFT JOIN users u1 ON so.created_by = u1.id
             LEFT JOIN users u2 ON so.assigned_to = u2.id
             WHERE so.id = ?`;
            console.log('Executando query de seleção da ordem:', {
                query: selectOrderQuery,
                params: [id]
            });

            const [newOrder] = await connection.query<RowDataPacket[]>(selectOrderQuery, [id]);
            console.log('Ordem recuperada:', newOrder[0]);

            const selectItemsQuery = 'SELECT * FROM checklist_items WHERE service_order_id = ?';
            console.log('Executando query de seleção dos itens:', {
                query: selectItemsQuery,
                params: [id]
            });

            const [checklistItems] = await connection.query<RowDataPacket[]>(selectItemsQuery, [id]);
            console.log('Itens recuperados:', checklistItems);

            const orderWithChecklist = { ...newOrder[0], checklist: checklistItems };
            
            console.log('Ordem de serviço criada com sucesso:', JSON.stringify(orderWithChecklist, null, 2));
            res.status(201).json(orderWithChecklist);
        } catch (error) {
            console.error('Erro durante a transação:', error);
            await connection.rollback();
            console.log('Transação revertida');
            throw error;
        } finally {
            connection.release();
            console.log('Conexão liberada');
        }
    } catch (error) {
        console.error('Erro ao criar ordem de serviço:', error);
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            details: error instanceof Error ? error.stack : undefined
        });
    }
});

// Atualizar ordem de serviço
router.put('/:id', async (req, res) => {
    const { title, description, status, priority, assigned_to, checklist } = req.body;
    const { id } = req.params;

    try {
        // Verifica se a ordem de serviço existe
        const [orders] = await pool.query<RowDataPacket[]>('SELECT * FROM service_orders WHERE id = ?', [id]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const completed_at = status === 'completed' ? 
                new Date().toISOString().slice(0, 19).replace('T', ' ') : 
                null;

            // Atualiza a ordem de serviço
            await connection.query(
                `UPDATE service_orders 
                 SET title = ?, 
                     description = ?, 
                     status = ?, 
                     priority = ?, 
                     assigned_to = ?,
                     completed_at = ?
                 WHERE id = ?`,
                [title, description, status, priority, assigned_to, completed_at, id]
            );

            // Atualiza os itens do checklist
            if (checklist && Array.isArray(checklist)) {
                // Remove itens existentes
                await connection.query('DELETE FROM checklist_items WHERE service_order_id = ?', [id]);

                // Insere novos itens
                for (const item of checklist) {
                    if (!item.text?.trim()) continue;
                    
                    const itemId = item.id || uuidv4();
                    await connection.query(
                        'INSERT INTO checklist_items (id, service_order_id, text, completed) VALUES (?, ?, ?, ?)',
                        [itemId, id, item.text.trim(), item.completed ? 1 : 0]
                    );
                }
            }

            await connection.commit();

            // Buscar a ordem de serviço atualizada com os nomes dos usuários e checklist
            const [updatedOrder] = await pool.query<RowDataPacket[]>(
                `SELECT so.*, 
                        u1.name as created_by_name,
                        u2.name as assigned_to_name
                 FROM service_orders so
                 LEFT JOIN users u1 ON so.created_by = u1.id
                 LEFT JOIN users u2 ON so.assigned_to = u2.id
                 WHERE so.id = ?`,
                [id]
            );

            const [checklistItems] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM checklist_items WHERE service_order_id = ?',
                [id]
            );

            const orderWithChecklist = { ...updatedOrder[0], checklist: checklistItems };

            res.json(orderWithChecklist);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erro ao atualizar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Deletar ordem de serviço
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query<RowDataPacket[] & { affectedRows: number }>(
            'DELETE FROM service_orders WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export { router }; 