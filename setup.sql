-- Criar banco de dados
DROP DATABASE IF EXISTS ordem_servico;
CREATE DATABASE ordem_servico;
USE ordem_servico;

-- Criar tabelas
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'collaborator') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_orders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'completed') NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Inserir dados iniciais (senha: 123456 para todos os usuários)
INSERT INTO users (id, name, email, password, role) VALUES
('user1', 'Thierry Martins', 'thierry@example.com', '123456', 'admin'),
('user2', 'João Silva', 'joao@example.com', '123456', 'collaborator'),
('user3', 'Maria Santos', 'maria@example.com', '123456', 'collaborator'),
('user4', 'Pedro Oliveira', 'pedro@example.com', '123456', 'collaborator'),
('user5', 'Ana Costa', 'ana@example.com', '123456', 'collaborator');

INSERT INTO service_orders (id, title, description, status, priority, created_by, assigned_to) VALUES
('order1', 'Manutenção Preventiva', 'Realizar manutenção preventiva nos equipamentos', 'pending', 'high', 'user1', 'user2'),
('order2', 'Instalação de Software', 'Instalar e configurar novo software', 'in_progress', 'medium', 'user1', 'user2'),
('order3', 'Atualização de Sistema', 'Atualizar sistema para última versão', 'pending', 'low', 'user1', 'user3');

INSERT INTO activities (id, service_order_id, description, status, created_by) VALUES
('activity1', 'order1', 'Verificar equipamentos', 'pending', 'user1'),
('activity2', 'order1', 'Limpar componentes', 'pending', 'user1'),
('activity3', 'order2', 'Baixar instalador', 'completed', 'user2'),
('activity4', 'order2', 'Configurar parâmetros', 'pending', 'user2'),
('activity5', 'order3', 'Backup dos dados', 'pending', 'user3');

INSERT INTO comments (id, service_order_id, user_id, content) VALUES
('comment1', 'order1', 'user1', 'Prioridade alta devido ao prazo'),
('comment2', 'order2', 'user2', 'Software baixado com sucesso'),
('comment3', 'order3', 'user3', 'Iniciando backup dos dados');

INSERT INTO chat_messages (id, sender_id, receiver_id, content) VALUES
('msg1', 'user1', 'user2', 'Como está o progresso da manutenção?'),
('msg2', 'user2', 'user1', 'Iniciando a verificação dos equipamentos'),
('msg3', 'user1', 'user3', 'Preciso do relatório de atualização'); 