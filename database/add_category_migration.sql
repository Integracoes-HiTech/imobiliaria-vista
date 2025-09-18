-- Migração para adicionar coluna de categoria na tabela properties
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna category na tabela properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'apartamento';

-- Adicionar constraint para validar as categorias
ALTER TABLE properties 
ADD CONSTRAINT check_category 
CHECK (category IN ('prontos', 'na_planta', 'apartamento', 'casa', 'cobertura', 'comercial', 'condominio', 'loteamento'));

-- Criar índice para melhor performance nas consultas por categoria
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Atualizar as propriedades existentes com categorias baseadas no título
UPDATE properties SET category = CASE
    WHEN LOWER(title) LIKE '%apartamento%' OR LOWER(title) LIKE '%apto%' THEN 'apartamento'
    WHEN LOWER(title) LIKE '%casa%' OR LOWER(title) LIKE '%sobrado%' THEN 'casa'
    WHEN LOWER(title) LIKE '%cobertura%' OR LOWER(title) LIKE '%penthouse%' THEN 'cobertura'
    WHEN LOWER(title) LIKE '%comercial%' OR LOWER(title) LIKE '%loja%' OR LOWER(title) LIKE '%galpão%' THEN 'comercial'
    WHEN LOWER(title) LIKE '%condomínio%' OR LOWER(title) LIKE '%condominio%' THEN 'condominio'
    WHEN LOWER(title) LIKE '%lote%' OR LOWER(title) LIKE '%terreno%' THEN 'loteamento'
    WHEN LOWER(title) LIKE '%planta%' OR LOWER(title) LIKE '%obra%' OR LOWER(title) LIKE '%lançamento%' THEN 'na_planta'
    WHEN status = 'available' AND (LOWER(title) LIKE '%pronto%' OR LOWER(title) LIKE '%entregue%') THEN 'prontos'
    ELSE 'apartamento'
END;

-- Atualizar as propriedades específicas do exemplo com categorias corretas
UPDATE properties SET category = 'apartamento' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE properties SET category = 'casa' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE properties SET category = 'cobertura' WHERE id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE properties SET category = 'casa' WHERE id = '550e8400-e29b-41d4-a716-446655440004';

-- Adicionar algumas propriedades de exemplo com diferentes categorias
INSERT INTO properties (
    id, title, description, price, price_formatted, location, state, 
    images, realtor_id, status, address, features, category
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Lançamento Residencial Premium',
    'Novo empreendimento com apartamentos de 2 e 3 quartos, área de lazer completa e localização privilegiada.',
    650000,
    'R$ 650.000',
    'Goiânia, GO',
    'GO',
    ARRAY['property1.jpg', 'property2.jpg'],
    '550e8400-e29b-41d4-a716-446655440101',
    'available',
    '{"street": "Avenida T-10, 1000", "neighborhood": "Setor Bueno", "city": "Goiânia", "state": "GO", "zip_code": "74230-010"}',
    '{"bedrooms": 2, "bathrooms": 2, "area": 85, "parking": 1}',
    'na_planta'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'Apartamento Pronto para Morar',
    'Apartamento totalmente pronto, com móveis planejados e acabamento de primeira qualidade.',
    750000,
    'R$ 750.000',
    'Brasília, DF',
    'DF',
    ARRAY['property2.jpg', 'property3.jpg'],
    '550e8400-e29b-41d4-a716-446655440102',
    'available',
    '{"street": "SQN 102, Bloco A", "neighborhood": "Asa Norte", "city": "Brasília", "state": "DF", "zip_code": "70712-100"}',
    '{"bedrooms": 3, "bathrooms": 2, "area": 95, "parking": 1}',
    'prontos'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'Loja Comercial Centro',
    'Loja comercial no centro da cidade, ideal para comércio ou escritório.',
    450000,
    'R$ 450.000',
    'São Paulo, SP',
    'SP',
    ARRAY['property3.jpg', 'property4.jpg'],
    '550e8400-e29b-41d4-a716-446655440103',
    'available',
    '{"street": "Rua Augusta, 500", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zip_code": "01305-000"}',
    '{"bedrooms": 0, "bathrooms": 1, "area": 60, "parking": 0}',
    'comercial'
),
(
    '550e8400-e29b-41d4-a716-446655440008',
    'Condomínio Residencial',
    'Casa em condomínio fechado com segurança 24h, área de lazer e muito verde.',
    950000,
    'R$ 950.000',
    'Campinas, SP',
    'SP',
    ARRAY['property4.jpg', 'property1.jpg'],
    '550e8400-e29b-41d4-a716-446655440104',
    'available',
    '{"street": "Rua das Orquídeas, 200", "neighborhood": "Cambuí", "city": "Campinas", "state": "SP", "zip_code": "13025-240"}',
    '{"bedrooms": 4, "bathrooms": 3, "area": 200, "parking": 2}',
    'condominio'
),
(
    '550e8400-e29b-41d4-a716-446655440009',
    'Terreno para Loteamento',
    'Terreno amplo em área em expansão, ideal para construção ou investimento.',
    180000,
    'R$ 180.000',
    'Ribeirão Preto, SP',
    'SP',
    ARRAY['property1.jpg', 'property2.jpg'],
    '550e8400-e29b-41d4-a716-446655440101',
    'available',
    '{"street": "Avenida Nove de Julho, 3000", "neighborhood": "Vila Seixas", "city": "Ribeirão Preto", "state": "SP", "zip_code": "14015-100"}',
    '{"bedrooms": 0, "bathrooms": 0, "area": 500, "parking": 0}',
    'loteamento'
);

-- Inserir histórico de status para as novas propriedades
INSERT INTO property_status_history (property_id, status, changed_by, notes) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'available', 'Ana Silva', 'Lançamento cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440006', 'available', 'Carlos Mendes', 'Apartamento pronto cadastrado no sistema'),
('550e8400-e29b-41d4-a716-446655440007', 'available', 'Marina Costa', 'Loja comercial cadastrada no sistema'),
('550e8400-e29b-41d4-a716-446655440008', 'available', 'João Santos', 'Casa em condomínio cadastrada no sistema'),
('550e8400-e29b-41d4-a716-446655440009', 'available', 'Ana Silva', 'Terreno para loteamento cadastrado no sistema');

-- Comentário sobre as categorias disponíveis
COMMENT ON COLUMN properties.category IS 'Categoria do imóvel: prontos, na_planta, apartamento, casa, cobertura, comercial, condominio, loteamento';
