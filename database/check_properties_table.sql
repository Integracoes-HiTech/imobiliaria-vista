-- Script para verificar a estrutura da tabela 'properties'

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'properties'
) AS table_exists;

-- Verificar a estrutura da tabela properties
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'properties'
ORDER BY ordinal_position;

-- Verificar se a coluna 'category' existe
SELECT EXISTS (
   SELECT FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'properties'
   AND column_name = 'category'
) AS category_column_exists;

-- Verificar alguns registros da tabela
SELECT id, title, category, status, created_at
FROM properties 
ORDER BY created_at DESC 
LIMIT 5;
