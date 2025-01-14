"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = require("./routes/users");
const serviceOrders_1 = require("./routes/serviceOrders");
const activities_1 = require("./routes/activities");
const chat_1 = require("./routes/chat");
const auth_1 = require("./routes/auth");
const auth_2 = require("./middleware/auth");
const settings_1 = require("./routes/settings");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Rotas públicas
app.use('/api/auth', auth_1.router);
// Middleware de autenticação para rotas protegidas
app.use('/api', auth_2.authenticateToken);
// Rotas protegidas
app.use('/api/users', users_1.router);
app.use('/api/service-orders', serviceOrders_1.router);
app.use('/api/activities', activities_1.router);
app.use('/api/chat', chat_1.router);
app.use('/api/settings', settings_1.router);
// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
