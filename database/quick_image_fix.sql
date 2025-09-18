-- Script rápido para corrigir imagens no banco
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o estado atual das imagens
SELECT 
  'ANTES DA CORREÇÃO' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN images::text LIKE '%blob:%' THEN 1 END) as com_blob,
  COUNT(CASE WHEN images::text LIKE '%property%' THEN 1 END) as com_property
FROM properties;

-- 2. Corrigir todas as imagens problemáticas
UPDATE properties 
SET images = ARRAY['property1.jpg']
WHERE images::text LIKE '%blob:%' 
   OR images IS NULL 
   OR array_length(images, 1) IS NULL 
   OR array_length(images, 1) = 0
   OR images::text = '{}'
   OR images::text = '[]';

-- 3. Verificar o resultado
SELECT 
  'DEPOIS DA CORREÇÃO' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN images::text LIKE '%blob:%' THEN 1 END) as com_blob,
  COUNT(CASE WHEN images::text LIKE '%property%' THEN 1 END) as com_property
FROM properties;

-- 4. Mostrar algumas propriedades como exemplo
SELECT 
  id,
  title,
  images
FROM properties 
ORDER BY created_at DESC
LIMIT 5;
