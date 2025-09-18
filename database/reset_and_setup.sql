-- Script para resetar e configurar o banco do zero
-- Execute este script no Supabase SQL Editor

-- 1. Deletar tabelas existentes (se existirem)
DROP TABLE IF EXISTS property_status_history CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Deletar função de trigger (se existir)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Recriar tudo do zero
-- Tabela de usuários (admin e corretores)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('admin', 'realtor')),
    is_active BOOLEAN DEFAULT true,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de propriedades
CREATE TABLE properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    price_formatted VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    images TEXT[] DEFAULT '{}',
    realtor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'negotiating', 'sold')),
    address JSONB NOT NULL DEFAULT '{}',
    features JSONB NOT NULL DEFAULT '{}',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de status das propriedades
CREATE TABLE property_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'negotiating', 'sold')),
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_properties_realtor ON properties(realtor_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created ON properties(created_at);

CREATE INDEX idx_status_history_property ON property_status_history(property_id);
CREATE INDEX idx_status_history_changed_at ON property_status_history(changed_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão
INSERT INTO users (id, name, email, phone, type, password_hash) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin MG Imóveis', 
    'admin@mgimoveis.com', 
    '11999999999', 
    'admin', 
    'YWRtaW4xMjNfc2FsdA=='
);

-- Inserir alguns corretores de exemplo
INSERT INTO users (id, name, email, phone, birth_date, type, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Ana Silva', 'ana.silva@mgimoveis.com', '11999887766', '1985-03-15', 'realtor', 'YW5hMTIzX3NhbHQ='),
('550e8400-e29b-41d4-a716-446655440102', 'Carlos Mendes', 'carlos.mendes@mgimoveis.com', '21988776655', '1978-07-22', 'realtor', 'Y2FybG9zMTIzX3NhbHQ='),
('550e8400-e29b-41d4-a716-446655440103', 'Marina Costa', 'marina.costa@mgimoveis.com', '13977665544', '1990-11-08', 'realtor', 'bWFyaW5hMTIzX3NhbHQ='),
('550e8400-e29b-41d4-a716-446655440104', 'João Santos', 'joao.santos@mgimoveis.com', '41966554433', '1982-05-30', 'realtor', 'am9hbzEyM19zYWx0');

-- Inserir algumas propriedades de exemplo
INSERT INTO properties (
    id, title, description, price, price_formatted, location, state, 
    images, realtor_id, status, address, features
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Apartamento Moderno no Centro',
    'Apartamento com acabamento premium, localizado no coração da cidade. Possui vista panorâmica, área de lazer completa e fácil acesso ao transporte público.',
    850000,
    'R$ 850.000',
    'São Paulo, SP',
    'SP',
    ARRAY['property1.jpg', 'property2.jpg', 'property3.jpg'],
    '550e8400-e29b-41d4-a716-446655440101',
    'available',
    '{"street": "Rua das Flores, 123", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zip_code": "01234-567"}',
    '{"bedrooms": 3, "bathrooms": 2, "area": 120, "parking": 2}'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Casa com Piscina - Bairro Nobre',
    'Belíssima casa com piscina e área gourmet. Perfeita para famílias que buscam conforto e qualidade de vida em um dos melhores bairros da cidade.',
    1200000,
    'R$ 1.200.000',
    'Rio de Janeiro, RJ',
    'RJ',
    ARRAY['property2.jpg', 'property3.jpg', 'property1.jpg'],
    '550e8400-e29b-41d4-a716-446655440102',
    'negotiating',
    '{"street": "Avenida Atlântica, 456", "neighborhood": "Copacabana", "city": "Rio de Janeiro", "state": "RJ", "zip_code": "22070-001"}',
    '{"bedrooms": 4, "bathrooms": 3, "area": 180, "parking": 3}'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Cobertura Duplex Premium',
    'Cobertura duplex com vista para o mar, terraço privativo e acabamento de luxo. Localizada em prédio com portaria 24h e área de lazer completa.',
    2500000,
    'R$ 2.500.000',
    'Santos, SP',
    'SP',
    ARRAY['property3.jpg', 'property4.jpg', 'property1.jpg'],
    '550e8400-e29b-41d4-a716-446655440103',
    'available',
    '{"street": "Avenida Bartolomeu de Gusmão, 789", "neighborhood": "Ponta da Praia", "city": "Santos", "state": "SP", "zip_code": "11030-906"}',
    '{"bedrooms": 5, "bathrooms": 4, "area": 250, "parking": 4}'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Casa Familiar Aconchegante',
    'Casa térrea com jardim amplo, perfect para famílias com crianças. Localizada em bairro residencial tranquilo, próxima a escolas e comércio.',
    480000,
    'R$ 480.000',
    'Curitiba, PR',
    'PR',
    ARRAY['property4.jpg', 'property1.jpg', 'property2.jpg'],
    '550e8400-e29b-41d4-a716-446655440104',
    'sold',
    '{"street": "Rua das Palmeiras, 321", "neighborhood": "Batel", "city": "Curitiba", "state": "PR", "zip_code": "80420-090"}',
    '{"bedrooms": 3, "bathrooms": 2, "area": 150, "parking": 2}'
);

-- Inserir histórico de status para as propriedades
INSERT INTO property_status_history (property_id, status, changed_by, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'available', 'Admin MG Imóveis', 'Imóvel cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440002', 'available', 'Carlos Mendes', 'Imóvel cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440002', 'negotiating', 'Carlos Mendes', 'Cliente interessado iniciou negociação'),
('550e8400-e29b-41d4-a716-446655440003', 'available', 'Marina Costa', 'Imóvel cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440004', 'available', 'João Santos', 'Imóvel cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440004', 'negotiating', 'João Santos', 'Cliente interessado iniciou negociação'),
('550e8400-e29b-41d4-a716-446655440004', 'sold', 'João Santos', 'Venda concluída com sucesso');

-- Políticas de segurança (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

-- Política para usuários: todos podem ler, apenas admin pode modificar
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admin can modify users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    )
);

-- Política para propriedades: todos podem ler, corretores podem modificar suas próprias
CREATE POLICY "Everyone can read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Realtors can modify their own properties" ON properties FOR ALL USING (
    realtor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    )
);

-- Política para histórico: todos podem ler, apenas admin pode modificar
CREATE POLICY "Everyone can read status history" ON property_status_history FOR SELECT USING (true);
CREATE POLICY "Only admin can modify status history" ON property_status_history FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    )
);

-- Verificar se tudo foi criado corretamente
SELECT 'Setup completo!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_properties FROM properties;
SELECT COUNT(*) as total_history FROM property_status_history;
