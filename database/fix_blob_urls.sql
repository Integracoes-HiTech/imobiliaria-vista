-- Script para corrigir URLs blob no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Atualizar propriedades que têm URLs blob para usar imagens padrão
UPDATE properties 
SET images = ARRAY['property1.jpg']
WHERE images::text LIKE '%blob:%';

-- Verificar quantas propriedades foram atualizadas
SELECT 
  COUNT(*) as propriedades_atualizadas,
  'Propriedades com URLs blob corrigidas' as descricao
FROM properties 
WHERE images::text LIKE '%blob:%';

-- Mostrar propriedades que ainda têm URLs blob (se houver)
SELECT 
  id,
  title,
  images
FROM properties 
WHERE images::text LIKE '%blob:%'
LIMIT 10;

-- Mostrar propriedades com imagens válidas
SELECT 
  id,
  title,
  images
FROM properties 
WHERE images::text NOT LIKE '%blob:%'
LIMIT 10;
