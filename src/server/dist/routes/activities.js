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
// Buscar todas as atividades de uma ordem de serviço
router.get('/service-order/:serviceOrderId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [activities] = yield database_1.default.query(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.service_order_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.serviceOrderId]);
        res.json(activities);
    }
    catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Buscar atividade por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [activities] = yield database_1.default.query(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [req.params.id]);
        if (activities.length === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }
        res.json(activities[0]);
    }
    catch (error) {
        console.error('Erro ao buscar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Criar nova atividade
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { service_order_id, description, created_by } = req.body;
    if (!service_order_id || !description || !created_by) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }
    try {
        const id = (0, uuid_1.v4)();
        yield database_1.default.query('INSERT INTO activities (id, service_order_id, description, status, created_by) VALUES (?, ?, ?, ?, ?)', [id, service_order_id, description, 'pending', created_by]);
        // Buscar a atividade criada com informações do usuário
        const [activities] = yield database_1.default.query(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [id]);
        res.status(201).json(activities[0]);
    }
    catch (error) {
        console.error('Erro ao criar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Atualizar atividade
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, status } = req.body;
    try {
        let query = 'UPDATE activities SET description = ?, status = ?';
        const params = [description, status];
        if (status === 'completed') {
            query += ', completed_at = CURRENT_TIMESTAMP';
        }
        query += ' WHERE id = ?';
        params.push(req.params.id);
        const [result] = yield database_1.default.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }
        // Buscar a atividade atualizada
        const [activities] = yield database_1.default.query(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [req.params.id]);
        res.json(activities[0]);
    }
    catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Deletar atividade
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('DELETE FROM activities WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
