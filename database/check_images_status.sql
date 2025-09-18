-- Script para verificar o status das imagens no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar propriedades com URLs blob
SELECT 
  'Propriedades com URLs blob' as tipo,
  COUNT(*) as quantidade
FROM properties 
WHERE images::text LIKE '%blob:%';

-- 2. Verificar propriedades com URLs do Supabase Storage
SELECT 
  'Propriedades com URLs Supabase' as tipo,
  COUNT(*) as quantidade
FROM properties 
WHERE images::text LIKE '%supabase.co%';

-- 3. Verificar propriedades com nomes de arquivo simples
SELECT 
  'Propriedades com nomes simples' as tipo,
  COUNT(*) as quantidade
FROM properties 
WHERE images::text NOT LIKE '%blob:%' 
  AND images::text NOT LIKE '%supabase.co%'
  AND images::text NOT LIKE '%http%';

-- 4. Mostrar exemplos de cada tipo
SELECT 
  'Exemplos de URLs blob' as tipo,
  id,
  title,
  images
FROM properties 
WHERE images::text LIKE '%blob:%'
LIMIT 3;

SELECT 
  'Exemplos de URLs Supabase' as tipo,
  id,
  title,
  images
FROM properties 
WHERE images::text LIKE '%supabase.co%'
LIMIT 3;

SELECT 
  'Exemplos de nomes simples' as tipo,
  id,
  title,
  images
FROM properties 
WHERE images::text NOT LIKE '%blob:%' 
  AND images::text NOT LIKE '%supabase.co%'
  AND images::text NOT LIKE '%http%'
LIMIT 3;

-- 5. Resumo geral
SELECT 
  COUNT(*) as total_propriedades,
  COUNT(CASE WHEN images::text LIKE '%blob:%' THEN 1 END) as com_blob_urls,
  COUNT(CASE WHEN images::text LIKE '%supabase.co%' THEN 1 END) as com_supabase_urls,
  COUNT(CASE WHEN images::text NOT LIKE '%blob:%' AND images::text NOT LIKE '%supabase.co%' AND images::text NOT LIKE '%http%' THEN 1 END) as com_nomes_simples
FROM properties;
