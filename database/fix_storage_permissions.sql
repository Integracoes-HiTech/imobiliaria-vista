-- Script para configurar storage com permissões limitadas
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para imagens (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se o bucket foi criado
SELECT 
  'Bucket Status:' as info,
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'images';

-- 3. Verificar políticas existentes
SELECT 
  'Existing Policies:' as info,
  policyname,
  cmd,
  roles::text
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%images%';

-- 4. Se não conseguir criar políticas, use estas instruções manuais:
-- 
-- VÁ PARA O SUPABASE DASHBOARD:
-- 1. Acesse: Storage > Settings
-- 2. Clique em "New Policy" para o bucket 'images'
-- 3. Crie estas políticas:
--
-- POLÍTICA 1 - SELECT (Leitura Pública):
-- Name: "Public Access Images"
-- Operation: SELECT
-- Target roles: public
-- USING expression: bucket_id = 'images'
--
-- POLÍTICA 2 - INSERT (Upload):
-- Name: "Authenticated Upload Images"  
-- Operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: bucket_id = 'images'
--
-- POLÍTICA 3 - UPDATE (Atualização):
-- Name: "Authenticated Update Images"
-- Operation: UPDATE  
-- Target roles: authenticated
-- USING expression: bucket_id = 'images'
--
-- POLÍTICA 4 - DELETE (Exclusão):
-- Name: "Authenticated Delete Images"
-- Operation: DELETE
-- Target roles: authenticated  
-- USING expression: bucket_id = 'images'
