-- Script para verificar e configurar o Supabase Storage
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o bucket 'images' existe
SELECT 
  id, 
  name, 
  public, 
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'images';

-- 2. Se o bucket não existir, criar
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%images%';

-- 4. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- 5. Criar políticas corretas para o bucket 'images'
CREATE POLICY "Public Access Images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 6. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%images%';

-- 7. Testar se o bucket está acessível
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'images';

-- 8. Comentários para documentação (apenas para políticas, pois COMMENT ON BUCKET não é suportado)
COMMENT ON POLICY "Public Access Images" ON storage.objects IS 'Permite acesso público às imagens do bucket images';
COMMENT ON POLICY "Authenticated users can upload images" ON storage.objects IS 'Permite upload apenas para usuários autenticados no bucket images';
COMMENT ON POLICY "Authenticated users can update images" ON storage.objects IS 'Permite atualização apenas para usuários autenticados no bucket images';
COMMENT ON POLICY "Authenticated users can delete images" ON storage.objects IS 'Permite exclusão apenas para usuários autenticados no bucket images';
