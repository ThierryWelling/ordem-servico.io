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
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SettingsService {
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield database_1.default.query(`
                SELECT s.*, t.*
                FROM system_settings s
                LEFT JOIN themes t ON s.active_theme_id = t.id
                WHERE s.id = ?
            `, ['1']);
                if (!rows[0])
                    return {};
                const settings = {
                    id: rows[0].id,
                    company_name: rows[0].company_name,
                    company_logo_url: rows[0].company_logo_url,
                    active_theme_id: rows[0].active_theme_id,
                    active_theme: rows[0].active_theme_id ? {
                        id: rows[0].active_theme_id,
                        name: rows[0].name,
                        primary_color: rows[0].primary_color,
                        secondary_color: rows[0].secondary_color,
                        font_size: rows[0].font_size,
                        border_radius: rows[0].border_radius,
                        is_dark: rows[0].is_dark,
                        is_default: rows[0].is_default
                    } : undefined
                };
                return settings;
            }
            catch (error) {
                console.error('Erro ao buscar configurações:', error);
                throw error;
            }
        });
    }
    updateSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateFields = [];
                const updateValues = [];
                Object.entries(settings).forEach(([key, value]) => {
                    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'active_theme') {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                });
                if (updateFields.length > 0) {
                    const query = `
                    UPDATE system_settings 
                    SET ${updateFields.join(', ')} 
                    WHERE id = '1'
                `;
                    yield database_1.default.query(query, [...updateValues]);
                }
                return this.getSettings();
            }
            catch (error) {
                console.error('Erro ao atualizar configurações:', error);
                throw error;
            }
        });
    }
    getAllThemes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield database_1.default.query('SELECT * FROM themes ORDER BY name');
                return rows;
            }
            catch (error) {
                console.error('Erro ao buscar temas:', error);
                throw error;
            }
        });
    }
    createTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = `theme-${Date.now()}`;
                yield database_1.default.query('INSERT INTO themes (id, name, primary_color, secondary_color, font_size, border_radius, is_dark) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, theme.name, theme.primary_color, theme.secondary_color, theme.font_size, theme.border_radius, theme.is_dark]);
                const [rows] = yield database_1.default.query('SELECT * FROM themes WHERE id = ?', [id]);
                return rows[0];
            }
            catch (error) {
                console.error('Erro ao criar tema:', error);
                throw error;
            }
        });
    }
    uploadCompanyLogo(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Iniciando upload do logo no serviço...');
                console.log('Arquivo recebido:', {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });
                const uploadDir = path_1.default.join(__dirname, '../../../public/uploads');
                console.log('Diretório de upload:', uploadDir);
                if (!fs_1.default.existsSync(uploadDir)) {
                    console.log('Criando diretório de upload...');
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `company-logo-${Date.now()}.${file.originalname.split('.').pop()}`;
                const filePath = path_1.default.join(uploadDir, fileName);
                console.log('Salvando arquivo em:', filePath);
                if (file.buffer) {
                    fs_1.default.writeFileSync(filePath, file.buffer);
                }
                else if (file.path) {
                    fs_1.default.copyFileSync(file.path, filePath);
                }
                else {
                    throw new Error('Arquivo inválido: nem buffer nem path estão disponíveis');
                }
                const fileUrl = `/uploads/${fileName}`;
                console.log('URL do arquivo:', fileUrl);
                yield this.updateSettings({ company_logo_url: fileUrl });
                console.log('URL atualizada no banco de dados');
                return fileUrl;
            }
            catch (error) {
                console.error('Erro detalhado ao fazer upload do logo:', {
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    stack: error instanceof Error ? error.stack : undefined,
                    file: {
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                });
                throw error;
            }
        });
    }
    updateTheme(id, theme) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateFields = [];
                const updateValues = [];
                Object.entries(theme).forEach(([key, value]) => {
                    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                        updateFields.push(`${key} = ?`);
                        updateValues.push(value);
                    }
                });
                if (updateFields.length > 0) {
                    const query = `
                    UPDATE themes 
                    SET ${updateFields.join(', ')} 
                    WHERE id = ?
                `;
                    yield database_1.default.query(query, [...updateValues, id]);
                }
                const [rows] = yield database_1.default.query('SELECT * FROM themes WHERE id = ?', [id]);
                return rows[0];
            }
            catch (error) {
                console.error('Erro ao atualizar tema:', error);
                throw error;
            }
        });
    }
    deleteTheme(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Verificar se não é um tema padrão
                const [rows] = yield database_1.default.query('SELECT is_default FROM themes WHERE id = ?', [id]);
                if ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.is_default) {
                    throw new Error('Não é possível excluir um tema padrão');
                }
                // Verificar se é o tema ativo
                const [settings] = yield database_1.default.query('SELECT active_theme_id FROM system_settings WHERE active_theme_id = ?', [id]);
                if (settings.length > 0) {
                    // Se for o tema ativo, mudar para o tema padrão claro
                    yield database_1.default.query('UPDATE system_settings SET active_theme_id = ? WHERE active_theme_id = ?', ['default-light', id]);
                }
                yield database_1.default.query('DELETE FROM themes WHERE id = ?', [id]);
            }
            catch (error) {
                console.error('Erro ao excluir tema:', error);
                throw error;
            }
        });
    }
}
exports.default = new SettingsService();
