-- Script para corrigir todas as URLs de imagem no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Atualizar propriedades com URLs blob para usar imagens padrão
UPDATE properties 
SET images = ARRAY['property1.jpg']
WHERE images::text LIKE '%blob:%';

-- 2. Atualizar propriedades com arrays vazios para usar imagem padrão
UPDATE properties 
SET images = ARRAY['property1.jpg']
WHERE images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0;

-- 3. Garantir que todas as propriedades tenham pelo menos uma imagem
UPDATE properties 
SET images = ARRAY['property1.jpg']
WHERE images::text = '{}' OR images::text = '[]';

-- 4. Verificar o resultado
SELECT 
  COUNT(*) as total_propriedades,
  COUNT(CASE WHEN images::text LIKE '%blob:%' THEN 1 END) as ainda_com_blob,
  COUNT(CASE WHEN images::text LIKE '%property1.jpg%' THEN 1 END) as com_property1,
  COUNT(CASE WHEN images::text LIKE '%property2.jpg%' THEN 1 END) as com_property2,
  COUNT(CASE WHEN images::text LIKE '%property3.jpg%' THEN 1 END) as com_property3,
  COUNT(CASE WHEN images::text LIKE '%property4.jpg%' THEN 1 END) as com_property4
FROM properties;

-- 5. Mostrar algumas propriedades como exemplo
SELECT 
  id,
  title,
  images
FROM properties 
LIMIT 5;
