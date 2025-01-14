USE ordem_servico;

-- Remover a coluna checklist da tabela service_orders
ALTER TABLE service_orders DROP COLUMN IF EXISTS checklist;

-- Atualizar restrições de chave estrangeira da tabela service_orders
ALTER TABLE service_orders DROP FOREIGN KEY IF EXISTS service_orders_ibfk_1;
ALTER TABLE service_orders DROP FOREIGN KEY IF EXISTS service_orders_ibfk_2;
ALTER TABLE service_orders ADD CONSTRAINT service_orders_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE service_orders ADD CONSTRAINT service_orders_assigned_to_fk FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Criar tabela de checklist_items
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(36) PRIMARY KEY,
    service_order_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
); 