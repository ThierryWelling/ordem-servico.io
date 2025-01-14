import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import fs from 'fs';
import path from 'path';

export interface Theme {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    font_size: number;
    border_radius: number;
    is_dark: boolean;
    is_default: boolean;
}

export interface SystemSettings {
    id: string;
    company_name: string;
    company_logo_url?: string;
    active_theme_id: string;
    active_theme?: Theme;
}

class SettingsService {
    async getSettings(): Promise<SystemSettings> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(`
                SELECT s.*, t.*
                FROM system_settings s
                LEFT JOIN themes t ON s.active_theme_id = t.id
                WHERE s.id = ?
            `, ['1']);

            if (!rows[0]) return {} as SystemSettings;

            const settings: SystemSettings = {
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
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            throw error;
        }
    }

    async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
        try {
            const updateFields: string[] = [];
            const updateValues: any[] = [];

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

                await pool.query(query, [...updateValues]);
            }

            return this.getSettings();
        } catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            throw error;
        }
    }

    async getAllThemes(): Promise<Theme[]> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM themes ORDER BY name');
            return rows as Theme[];
        } catch (error) {
            console.error('Erro ao buscar temas:', error);
            throw error;
        }
    }

    async createTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
        try {
            const id = `theme-${Date.now()}`;
            await pool.query(
                'INSERT INTO themes (id, name, primary_color, secondary_color, font_size, border_radius, is_dark) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, theme.name, theme.primary_color, theme.secondary_color, theme.font_size, theme.border_radius, theme.is_dark]
            );

            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM themes WHERE id = ?', [id]);
            return rows[0] as Theme;
        } catch (error) {
            console.error('Erro ao criar tema:', error);
            throw error;
        }
    }

    async uploadCompanyLogo(file: Express.Multer.File): Promise<string> {
        try {
            const uploadDir = path.join(__dirname, '../../../public/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `company-logo-${Date.now()}.${file.originalname.split('.').pop()}`;
            const filePath = path.join(uploadDir, fileName);
            
            fs.writeFileSync(filePath, file.buffer);
            
            const fileUrl = `/uploads/${fileName}`;
            await this.updateSettings({ company_logo_url: fileUrl });

            return fileUrl;
        } catch (error) {
            console.error('Erro ao fazer upload do logo:', error);
            throw error;
        }
    }
}

export default new SettingsService(); 