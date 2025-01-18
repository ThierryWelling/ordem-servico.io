USE ordem_servico;

-- Limpar dados existentes (na ordem correta para respeitar as foreign keys)
DELETE FROM chat_messages;
DELETE FROM comments;
DELETE FROM activities;
DELETE FROM checklist_items;
DELETE FROM service_orders;
DELETE FROM system_settings;
DELETE FROM themes;
DELETE FROM users;

-- Inserir temas
INSERT INTO themes (id, name, primary_color, secondary_color, font_size, border_radius, is_dark, is_default) VALUES
('theme-light-1', 'Tema Claro - Azul', '#1976d2', '#dc004e', 16, 8, false, true),
('theme-light-2', 'Tema Claro - Verde', '#2e7d32', '#f50057', 16, 4, false, false),
('theme-light-3', 'Tema Claro - Roxo', '#7b1fa2', '#ff4081', 16, 12, false, false),
('theme-dark-1', 'Tema Escuro - Azul', '#90caf9', '#f48fb1', 16, 8, true, false),
('theme-dark-2', 'Tema Escuro - Verde', '#a5d6a7', '#ff80ab', 16, 4, true, false);

-- Inserir usuários
INSERT INTO users (id, name, email, password, role, sequence, company_name, company_logo, status) VALUES
('user-1', 'Admin', 'admin@example.com', '$2b$10$...', 'admin', 1, 'Empresa A', NULL, 'active'),
('user-2', 'Colaborador 1', 'colab1@example.com', '$2b$10$...', 'collaborator', 2, 'Empresa B', NULL, 'active'),
('user-3', 'Colaborador 2', 'colab2@example.com', '$2b$10$...', 'collaborator', 3, 'Empresa C', NULL, 'active');

-- Inserir ordens de serviço
INSERT INTO service_orders (id, title, description, status, priority, assigned_to, created_by, created_at, updated_at) VALUES
('os-1', 'Website E-commerce', 'Desenvolvimento de loja virtual', 'in_progress', 'high', 'user-2', 'user-1', NOW(), NOW()),
('os-2', 'Campanha Marketing', 'Campanha redes sociais', 'pending', 'medium', 'user-3', 'user-1', NOW(), NOW()),
('os-3', 'Design Logo', 'Criação de identidade visual', 'completed', 'low', 'user-2', 'user-1', NOW(), NOW());

-- Inserir itens de checklist
INSERT INTO checklist_items (id, service_order_id, title, completed, created_at, updated_at) VALUES
-- OS-1: Website E-commerce
('check-1-1', 'os-1', 'Análise de requisitos', true, NOW(), NOW()),
('check-1-2', 'os-1', 'Design de interface', true, NOW(), NOW()),
('check-1-3', 'os-1', 'Desenvolvimento frontend', false, NOW(), NOW()),
('check-1-4', 'os-1', 'Desenvolvimento backend', false, NOW(), NOW()),
('check-1-5', 'os-1', 'Testes e ajustes', false, NOW(), NOW()),

-- OS-2: Campanha Marketing
('check-2-1', 'os-2', 'Pesquisa de público-alvo', true, NOW(), NOW()),
('check-2-2', 'os-2', 'Criação de conteúdo', false, NOW(), NOW()),
('check-2-3', 'os-2', 'Design de posts', false, NOW(), NOW()),
('check-2-4', 'os-2', 'Programação de posts', false, NOW(), NOW()),

-- OS-3: Design Logo
('check-3-1', 'os-3', 'Briefing com cliente', true, NOW(), NOW()),
('check-3-2', 'os-3', 'Desenvolvimento de conceitos', true, NOW(), NOW()),
('check-3-3', 'os-3', 'Apresentação de propostas', true, NOW(), NOW()),
('check-3-4', 'os-3', 'Ajustes finais', true, NOW(), NOW());

-- Inserir atividades
INSERT INTO activities (id, service_order_id, description, status, created_by) VALUES
('act-1', 'os-1', 'Iniciada análise de requisitos do e-commerce', 'completed', 'user-colab-1'),
('act-2', 'os-1', 'Design de interface em andamento', 'completed', 'user-colab-1'),
('act-3', 'os-1', 'Desenvolvimento frontend iniciado', 'pending', 'user-colab-1'),
('act-4', 'os-2', 'Pesquisa de público-alvo concluída', 'completed', 'user-colab-2'),
('act-5', 'os-2', 'Iniciando criação de conteúdo', 'pending', 'user-colab-2'),
('act-6', 'os-3', 'Logo finalizada e aprovada pelo cliente', 'completed', 'user-colab-3');

-- Inserir comentários
INSERT INTO comments (id, service_order_id, user_id, content) VALUES
('com-1', 'os-1', 'user-admin-1', 'Priorizar módulo de pagamento'),
('com-2', 'os-1', 'user-colab-1', 'Interface principal concluída'),
('com-3', 'os-2', 'user-admin-1', 'Focar em público jovem'),
('com-4', 'os-2', 'user-colab-2', 'Pesquisa indica preferência por Instagram'),
('com-5', 'os-3', 'user-admin-2', 'Cliente aprovou a versão final'),
('com-6', 'os-3', 'user-colab-3', 'Enviando arquivos em todos os formatos');

-- Inserir mensagens de chat
INSERT INTO chat_messages (id, sender_id, receiver_id, content) VALUES
('msg-1', 'user-admin-1', 'user-colab-1', 'Como está o progresso do e-commerce?'),
('msg-2', 'user-colab-1', 'user-admin-1', 'Frontend em 60% concluído'),
('msg-3', 'user-admin-1', 'user-colab-2', 'Precisamos agilizar a campanha'),
('msg-4', 'user-colab-2', 'user-admin-1', 'Conteúdo será entregue amanhã'),
('msg-5', 'user-admin-2', 'user-colab-3', 'Cliente amou a logo!'),
('msg-6', 'user-colab-3', 'user-admin-2', 'Ótimo! Enviando arquivos finais'); 