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
// Buscar todos os itens do checklist de uma ordem de serviço
router.get('/service-order/:serviceOrderId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [items] = yield database_1.default.query(`SELECT * FROM checklist_items 
             WHERE service_order_id = ?
             ORDER BY created_at ASC`, [req.params.serviceOrderId]);
        res.json(items);
    }
    catch (error) {
        console.error('Erro ao buscar itens do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Adicionar novo item ao checklist
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service_order_id, text } = req.body;
        if (!service_order_id || !text) {
            return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
        }
        const id = (0, uuid_1.v4)();
        yield database_1.default.query(`INSERT INTO checklist_items (id, service_order_id, text, completed)
             VALUES (?, ?, ?, false)`, [id, service_order_id, text]);
        const [newItem] = yield database_1.default.query('SELECT * FROM checklist_items WHERE id = ?', [id]);
        res.status(201).json(newItem[0]);
    }
    catch (error) {
        console.error('Erro ao criar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Atualizar item do checklist
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, completed } = req.body;
        const { id } = req.params;
        const [result] = yield database_1.default.query(`UPDATE checklist_items 
             SET text = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`, [text, completed, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item do checklist não encontrado' });
        }
        const [updatedItem] = yield database_1.default.query('SELECT * FROM checklist_items WHERE id = ?', [id]);
        res.json(updatedItem[0]);
    }
    catch (error) {
        console.error('Erro ao atualizar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Deletar item do checklist
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('DELETE FROM checklist_items WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item do checklist não encontrado' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
