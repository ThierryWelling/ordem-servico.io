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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
exports.router = router;
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Tentativa de login:', { email, password: '***' });
        if (!email || !password) {
            console.log('Email ou senha não fornecidos');
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }
        // Buscar usuário
        const [users] = yield database_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Usuário encontrado:', users.length > 0);
        if (users.length === 0) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }
        const user = users[0];
        console.log('Dados do usuário:', { id: user.id, email: user.email, role: user.role });
        // Verificar senha
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        console.log('Senha válida:', validPassword);
        if (!validPassword) {
            console.log('Senha inválida');
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }
        // Gerar token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        // Remover senha do objeto de resposta
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            message: 'Erro ao realizar login',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
const verifyHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const [users] = yield database_1.default.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        res.json({ user: users[0] });
    }
    catch (error) {
        res.status(403).json({ message: 'Token inválido' });
    }
});
router.post('/login', loginHandler);
router.get('/verify', verifyHandler);
