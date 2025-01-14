-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS ordem_servico;
USE ordem_servico;

-- Remover tabelas existentes na ordem correta (para evitar problemas com chaves estrangeiras)
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS checklist_items;
DROP TABLE IF EXISTS service_orders;
DROP TABLE IF EXISTS users;

-- Tabela de Temas
CREATE TABLE IF NOT EXISTS themes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    font_size INT NOT NULL,
    border_radius INT NOT NULL,
    is_dark BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255),
    company_logo_url TEXT,
    active_theme_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (active_theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'collaborator') NOT NULL,
    sequence INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS service_orders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    created_by VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date DATETIME NULL DEFAULT NULL,
    completed_at DATETIME NULL DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Tabela de Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Tabela de Anexos
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Tabela de Itens do Checklist
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

-- Inserir dados iniciais
-- Inserir tema padrão claro
INSERT INTO themes (id, name, primary_color, secondary_color, font_size, border_radius, is_dark, is_default) 
VALUES ('default-light', 'Tema Padrão Claro', '#1976d2', '#dc004e', 16, 8, false, true)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    primary_color = VALUES(primary_color),
    secondary_color = VALUES(secondary_color),
    font_size = VALUES(font_size),
    border_radius = VALUES(border_radius),
    is_dark = VALUES(is_dark),
    is_default = VALUES(is_default);

-- Inserir tema padrão escuro
INSERT INTO themes (id, name, primary_color, secondary_color, font_size, border_radius, is_dark, is_default)
VALUES ('default-dark', 'Tema Padrão Escuro', '#90caf9', '#f48fb1', 16, 8, true, false)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    primary_color = VALUES(primary_color),
    secondary_color = VALUES(secondary_color),
    font_size = VALUES(font_size),
    border_radius = VALUES(border_radius),
    is_dark = VALUES(is_dark),
    is_default = VALUES(is_default);

-- Inserir configuração inicial
INSERT INTO system_settings (id, company_name, active_theme_id)
VALUES ('1', 'Minha Empresa', 'default-light')
ON DUPLICATE KEY UPDATE 
    company_name = VALUES(company_name),
    active_theme_id = VALUES(active_theme_id); 