USE ordem_servico;

-- Adicionar coluna checklist se ela não existir
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS checklist JSON; 