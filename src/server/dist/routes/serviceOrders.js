"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
exports.router = router;
// Buscar todas as ordens de serviço
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [orders] = yield database_1.default.query(`
            SELECT so.*, 
                   u1.name as created_by_name,
                   u2.name as assigned_to_name
            FROM service_orders so
            LEFT JOIN users u1 ON so.created_by = u1.id
            LEFT JOIN users u2 ON so.assigned_to = u2.id
        `);
        // Buscar checklist para cada ordem de serviço
        const ordersWithChecklist = yield Promise.all(orders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            const [checklist] = yield database_1.default.query('SELECT * FROM checklist_items WHERE service_order_id = ?', [order.id]);
            return Object.assign(Object.assign({}, order), { checklist });
        })));
        res.json(ordersWithChecklist);
    }
    catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Buscar ordens de serviço por usuário
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [orders] = yield database_1.default.query(`SELECT so.*, 
                    u1.name as created_by_name,
                    u2.name as assigned_to_name
             FROM service_orders so
             LEFT JOIN users u1 ON so.created_by = u1.id
             LEFT JOIN users u2 ON so.assigned_to = u2.id
             WHERE so.created_by = ? OR so.assigned_to = ?`, [req.params.userId, req.params.userId]);
        res.json(orders);
    }
    catch (error) {
        console.error('Erro ao buscar ordens de serviço do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Buscar ordem de serviço por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [orders] = yield database_1.default.query(`SELECT so.*, 
                    u1.name as created_by_name,
                    u2.name as assigned_to_name
             FROM service_orders so
             LEFT JOIN users u1 ON so.created_by = u1.id
             LEFT JOIN users u2 ON so.assigned_to = u2.id
             WHERE so.id = ?`, [req.params.id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        res.json(orders[0]);
    }
    catch (error) {
        console.error('Erro ao buscar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Criar nova ordem de serviço
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        if (!(title === null || title === void 0 ? void 0 : title.trim()) || !priority || !created_by) {
            const error = {
                message: 'Campos obrigatórios não preenchidos',
                details: {
                    title: !(title === null || title === void 0 ? void 0 : title.trim()) ? 'Título é obrigatório' : null,
                    priority: !priority ? 'Prioridade é obrigatória' : null,
                    created_by: !created_by ? 'Criador é obrigatório' : null
                }
            };
            console.log('Erro de validação:', error);
            return res.status(400).json(error);
        }
        // Validar usuário criador
        const [users] = yield database_1.default.query('SELECT id FROM users WHERE id = ?', [created_by]);
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
            const [assignedUsers] = yield database_1.default.query('SELECT id FROM users WHERE id = ?', [assigned_to]);
            if (assignedUsers.length === 0) {
                const error = {
                    message: 'Usuário atribuído não encontrado',
                    details: { assigned_to }
                };
                console.log('Erro de validação:', error);
                return res.status(400).json(error);
            }
        }
        const connection = yield database_1.default.getConnection();
        console.log('Conexão com o banco de dados obtida');
        try {
            yield connection.beginTransaction();
            console.log('Transação iniciada');
            const id = (0, uuid_1.v4)();
            const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
            // Criar ordem de serviço
            const insertOrderQuery = `INSERT INTO service_orders 
                (id, title, description, status, priority, created_by, assigned_to, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertOrderParams = [
                id,
                title.trim(),
                (description === null || description === void 0 ? void 0 : description.trim()) || '',
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
            yield connection.query(insertOrderQuery, insertOrderParams);
            console.log('Ordem de serviço criada com ID:', id);
            // Criar itens do checklist se fornecidos
            if (checklist && Array.isArray(checklist)) {
                console.log('Criando itens do checklist:', JSON.stringify(checklist, null, 2));
                for (const item of checklist) {
                    if (!((_a = item.text) === null || _a === void 0 ? void 0 : _a.trim())) {
                        throw new Error('Item do checklist sem texto');
                    }
                    const checklistItemId = (0, uuid_1.v4)();
                    const insertItemQuery = 'INSERT INTO checklist_items (id, service_order_id, text, completed) VALUES (?, ?, ?, ?)';
                    const insertItemParams = [checklistItemId, id, item.text.trim(), Boolean(item.completed)];
                    console.log('Executando query de inserção do item:', {
                        query: insertItemQuery,
                        params: insertItemParams
                    });
                    yield connection.query(insertItemQuery, insertItemParams);
                    console.log('Item do checklist criado:', {
                        id: checklistItemId,
                        service_order_id: id,
                        text: item.text.trim(),
                        completed: item.completed || false
                    });
                }
            }
            yield connection.commit();
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
            const [newOrder] = yield connection.query(selectOrderQuery, [id]);
            console.log('Ordem recuperada:', newOrder[0]);
            const selectItemsQuery = 'SELECT * FROM checklist_items WHERE service_order_id = ?';
            console.log('Executando query de seleção dos itens:', {
                query: selectItemsQuery,
                params: [id]
            });
            const [checklistItems] = yield connection.query(selectItemsQuery, [id]);
            console.log('Itens recuperados:', checklistItems);
            const orderWithChecklist = Object.assign(Object.assign({}, newOrder[0]), { checklist: checklistItems });
            console.log('Ordem de serviço criada com sucesso:', JSON.stringify(orderWithChecklist, null, 2));
            res.status(201).json(orderWithChecklist);
        }
        catch (error) {
            console.error('Erro durante a transação:', error);
            yield connection.rollback();
            console.log('Transação revertida');
            throw error;
        }
        finally {
            connection.release();
            console.log('Conexão liberada');
        }
    }
    catch (error) {
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
}));
// Atualizar ordem de serviço
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description, status, priority, assigned_to, checklist } = req.body;
    const { id } = req.params;
    try {
        // Verifica se a ordem de serviço existe
        const [orders] = yield database_1.default.query('SELECT * FROM service_orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        const connection = yield database_1.default.getConnection();
        yield connection.beginTransaction();
        try {
            const completed_at = status === 'completed' ?
                new Date().toISOString().slice(0, 19).replace('T', ' ') :
                null;
            // Atualiza a ordem de serviço
            yield connection.query(`UPDATE service_orders 
                 SET title = ?, 
                     description = ?, 
                     status = ?, 
                     priority = ?, 
                     assigned_to = ?,
                     completed_at = ?
                 WHERE id = ?`, [title, description, status, priority, assigned_to, completed_at, id]);
            // Atualiza os itens do checklist
            if (checklist && Array.isArray(checklist)) {
                // Remove itens existentes
                yield connection.query('DELETE FROM checklist_items WHERE service_order_id = ?', [id]);
                // Insere novos itens
                for (const item of checklist) {
                    if (!((_a = item.text) === null || _a === void 0 ? void 0 : _a.trim()))
                        continue;
                    const itemId = item.id || (0, uuid_1.v4)();
                    yield connection.query('INSERT INTO checklist_items (id, service_order_id, text, completed) VALUES (?, ?, ?, ?)', [itemId, id, item.text.trim(), item.completed ? 1 : 0]);
                }
            }
            yield connection.commit();
            // Buscar a ordem de serviço atualizada com os nomes dos usuários e checklist
            const [updatedOrder] = yield database_1.default.query(`SELECT so.*, 
                        u1.name as created_by_name,
                        u2.name as assigned_to_name
                 FROM service_orders so
                 LEFT JOIN users u1 ON so.created_by = u1.id
                 LEFT JOIN users u2 ON so.assigned_to = u2.id
                 WHERE so.id = ?`, [id]);
            const [checklistItems] = yield database_1.default.query('SELECT * FROM checklist_items WHERE service_order_id = ?', [id]);
            const orderWithChecklist = Object.assign(Object.assign({}, updatedOrder[0]), { checklist: checklistItems });
            res.json(orderWithChecklist);
        }
        catch (error) {
            yield connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('Erro ao atualizar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Deletar ordem de serviço
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('DELETE FROM service_orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
