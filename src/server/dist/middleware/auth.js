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
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        console.log('Auth Header:', authHeader);
        const token = authHeader && authHeader.split(' ')[1];
        console.log('Token:', token);
        if (!token) {
            console.log('Token não fornecido');
            return res.status(401).json({ message: 'Token de autenticação não fornecido' });
        }
        try {
            console.log('Verificando token...');
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
            console.log('Token decodificado:', decoded);
            // Buscar usuário no banco de dados
            console.log('Buscando usuário no banco...');
            const [users] = yield database_1.default.query('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
            console.log('Usuário encontrado:', users[0]);
            if (users.length === 0) {
                console.log('Usuário não encontrado no banco');
                return res.status(401).json({ message: 'Usuário não encontrado' });
            }
            req.user = {
                id: users[0].id,
                role: users[0].role
            };
            console.log('Usuário autenticado:', req.user);
            next();
        }
        catch (jwtError) {
            console.error('Erro ao verificar token:', jwtError);
            return res.status(403).json({
                message: 'Token inválido',
                error: jwtError instanceof Error ? jwtError.message : 'Erro desconhecido'
            });
        }
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({
            message: 'Erro interno do servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
};
exports.isAdmin = isAdmin;
