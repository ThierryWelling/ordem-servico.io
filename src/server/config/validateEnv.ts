import { config } from 'dotenv';

export function validateEnv() {
    config();

    const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET',
        'UPLOAD_DIR'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        throw new Error(`As seguintes variáveis de ambiente são obrigatórias: ${missingEnvVars.join(', ')}`);
    }

    // Validar valores específicos
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
        throw new Error('NODE_ENV deve ser "development" ou "production"');
    }

    const port = parseInt(process.env.PORT || '');
    if (isNaN(port) || port <= 0) {
        throw new Error('PORT deve ser um número positivo');
    }

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '');
    if (isNaN(maxFileSize) || maxFileSize <= 0) {
        throw new Error('MAX_FILE_SIZE deve ser um número positivo');
    }

    // Validar formato da URL do CORS
    try {
        if (process.env.CORS_ORIGIN) {
            new URL(process.env.CORS_ORIGIN);
        }
    } catch {
        throw new Error('CORS_ORIGIN deve ser uma URL válida');
    }
} 