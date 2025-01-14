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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const settingsService_1 = __importDefault(require("../services/settingsService"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.router = router;
// Configuração do multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path_1.default.join(__dirname, '../../../public/uploads');
        console.log('Diretório de upload:', uploadDir);
        if (!fs_1.default.existsSync(uploadDir)) {
            console.log('Criando diretório de upload...');
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'logo-' + uniqueSuffix + path_1.default.extname(file.originalname);
        console.log('Nome do arquivo:', filename);
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        console.log('Tipo do arquivo:', file.mimetype);
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
// Handlers
const getThemes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const themes = yield settingsService_1.default.getAllThemes();
        res.json(themes);
    }
    catch (error) {
        next(error);
    }
});
const createTheme = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const theme = yield settingsService_1.default.createTheme(req.body);
        res.status(201).json(theme);
    }
    catch (error) {
        next(error);
    }
});
const getSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield settingsService_1.default.getSettings();
        res.json(settings);
    }
    catch (error) {
        next(error);
    }
});
const updateSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield settingsService_1.default.updateSettings(req.body);
        res.json(settings);
    }
    catch (error) {
        next(error);
    }
});
const uploadLogo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Iniciando upload do logo...');
        console.log('Arquivo recebido:', req.file);
        if (!req.file) {
            console.log('Nenhum arquivo recebido');
            res.status(400).json({ message: 'Nenhum arquivo enviado' });
            return;
        }
        console.log('Processando arquivo...');
        const fileUrl = yield settingsService_1.default.uploadCompanyLogo(req.file);
        console.log('Upload concluído. URL:', fileUrl);
        res.json({ logo_url: fileUrl });
    }
    catch (error) {
        console.error('Erro no upload do logo:', error);
        if (error instanceof Error) {
            res.status(500).json({
                message: 'Erro ao fazer upload do logo',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
        else {
            res.status(500).json({
                message: 'Erro ao fazer upload do logo',
                error: 'Erro desconhecido'
            });
        }
    }
});
const updateTheme = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const theme = yield settingsService_1.default.updateTheme(req.params.id, req.body);
        res.json(theme);
    }
    catch (error) {
        next(error);
    }
});
const deleteTheme = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield settingsService_1.default.deleteTheme(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Rotas
router.get('/themes', auth_1.authenticateToken, getThemes);
router.post('/themes', auth_1.authenticateToken, createTheme);
router.get('/', auth_1.authenticateToken, getSettings);
router.put('/', auth_1.authenticateToken, updateSettings);
router.post('/logo', auth_1.authenticateToken, upload.single('logo'), uploadLogo);
router.put('/themes/:id', auth_1.authenticateToken, updateTheme);
router.delete('/themes/:id', auth_1.authenticateToken, deleteTheme);
