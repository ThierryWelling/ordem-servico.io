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
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.router = router;
// Buscar todos os usuários
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users] = yield database_1.default.query('SELECT id, name, email, role, sequence FROM users ORDER BY sequence ASC');
        res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Buscar usuário por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users] = yield database_1.default.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(users[0]);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Criar novo usuário
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    try {
        const id = (0, uuid_1.v4)();
        yield database_1.default.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, password, role]);
        res.status(201).json({ id, name, email, role });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Atualizar usuário
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, role, sequence } = req.body;
    const { id } = req.params;
    try {
        // Verifica se o usuário existe
        const [users] = yield database_1.default.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        const connection = yield database_1.default.getConnection();
        yield connection.beginTransaction();
        try {
            // Atualiza o usuário
            const updateFields = [];
            const updateValues = [];
            if (name) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (email) {
                updateFields.push('email = ?');
                updateValues.push(email);
            }
            if (role) {
                updateFields.push('role = ?');
                updateValues.push(role);
            }
            if (sequence !== undefined) {
                updateFields.push('sequence = ?');
                updateValues.push(sequence);
            }
            if (updateFields.length > 0) {
                const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
                yield connection.query(query, [...updateValues, id]);
            }
            yield connection.commit();
            // Buscar usuário atualizado
            const [updatedUser] = yield database_1.default.query('SELECT id, name, email, role, sequence FROM users WHERE id = ?', [id]);
            res.json(updatedUser[0]);
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
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
// Deletar usuário
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
