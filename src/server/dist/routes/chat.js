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
// Buscar conversas de um usuário
router.get('/conversations/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [conversations] = yield database_1.default.query(`
            SELECT DISTINCT 
                CASE 
                    WHEN cm.sender_id = ? THEN cm.receiver_id
                    ELSE cm.sender_id
                END as other_user_id,
                u.name as other_user_name,
                u.role as other_user_role,
                (
                    SELECT content 
                    FROM chat_messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                        OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT created_at 
                    FROM chat_messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                        OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message_time,
                (
                    SELECT COUNT(*) 
                    FROM chat_messages 
                    WHERE sender_id = u.id 
                        AND receiver_id = ? 
                        AND read_at IS NULL
                ) as unread_count
            FROM chat_messages cm
            JOIN users u ON (
                CASE 
                    WHEN cm.sender_id = ? THEN cm.receiver_id
                    ELSE cm.sender_id
                END = u.id
            )
            WHERE cm.sender_id = ? OR cm.receiver_id = ?
            ORDER BY last_message_time DESC
        `, [
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId
        ]);
        res.json(conversations);
    }
    catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Buscar mensagens entre dois usuários
router.get('/messages/:userId/:otherUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Marcar mensagens como lidas
        yield database_1.default.query('UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL', [req.params.otherUserId, req.params.userId]);
        // Buscar mensagens
        const [messages] = yield database_1.default.query(`
            SELECT cm.*, 
                   s.name as sender_name,
                   r.name as receiver_name
            FROM chat_messages cm
            JOIN users s ON cm.sender_id = s.id
            JOIN users r ON cm.receiver_id = r.id
            WHERE (cm.sender_id = ? AND cm.receiver_id = ?)
               OR (cm.sender_id = ? AND cm.receiver_id = ?)
            ORDER BY cm.created_at ASC
        `, [
            req.params.userId,
            req.params.otherUserId,
            req.params.otherUserId,
            req.params.userId
        ]);
        res.json(messages);
    }
    catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Enviar mensagem
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sender_id, receiver_id, content } = req.body;
    if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }
    try {
        const id = (0, uuid_1.v4)();
        yield database_1.default.query('INSERT INTO chat_messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)', [id, sender_id, receiver_id, content]);
        // Buscar a mensagem criada com informações dos usuários
        const [messages] = yield database_1.default.query(`
            SELECT cm.*, 
                   s.name as sender_name,
                   r.name as receiver_name
            FROM chat_messages cm
            JOIN users s ON cm.sender_id = s.id
            JOIN users r ON cm.receiver_id = r.id
            WHERE cm.id = ?
        `, [id]);
        res.status(201).json(messages[0]);
    }
    catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Marcar mensagens como lidas
router.put('/read/:senderId/:receiverId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.query('UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL', [req.params.senderId, req.params.receiverId]);
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
