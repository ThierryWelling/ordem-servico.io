// Funções auxiliares para conversão de caso
const toCamelCase = (str: string): string => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
const toSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const convertToCamelCase = <T>(obj: unknown): T => {
    if (!obj) return obj as T;
    if (Array.isArray(obj)) {
        return obj.map(convertToCamelCase) as T;
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);
            acc[camelKey] = convertToCamelCase((obj as Record<string, unknown>)[key]);
            return acc;
        }, {} as Record<string, unknown>) as T;
    }
    return obj as T;
};

export const convertToSnakeCase = <T>(obj: unknown): T => {
    if (!obj) return obj as T;
    if (Array.isArray(obj)) {
        return obj.map(convertToSnakeCase) as T;
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);
            acc[snakeKey] = convertToSnakeCase((obj as Record<string, unknown>)[key]);
            return acc;
        }, {} as Record<string, unknown>) as T;
    }
    return obj as T;
}; 