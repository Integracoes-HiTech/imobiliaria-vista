-- Script para criar novo bucket "imobiliaria-images" para upload de imagens
-- Execute este script no Supabase SQL Editor

-- 1. Verificar buckets existentes
SELECT 
  id, 
  name, 
  public, 
  created_at,
  updated_at
FROM storage.buckets 
ORDER BY created_at DESC;

-- 2. Criar novo bucket "imobiliaria-images"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imobiliaria-images', 
  'imobiliaria-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 3. Remover políticas antigas do bucket "imobiliaria-images" (se existirem)
DROP POLICY IF EXISTS "Public Access Imobiliaria Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload imobiliaria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update imobiliaria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete imobiliaria images" ON storage.objects;

-- 4. Criar políticas para o novo bucket "imobiliaria-images"

-- Política para leitura pública (qualquer pessoa pode ver as imagens)
CREATE POLICY "Public Access Imobiliaria Images" ON storage.objects
FOR SELECT USING (bucket_id = 'imobiliaria-images');

-- Política para upload (apenas usuários autenticados)
CREATE POLICY "Authenticated users can upload imobiliaria images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'imobiliaria-images' 
  AND auth.role() = 'authenticated'
);

-- Política para atualização (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update imobiliaria images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'imobiliaria-images' 
  AND auth.role() = 'authenticated'
);

-- Política para exclusão (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete imobiliaria images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'imobiliaria-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Verificar se o bucket foi criado corretamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'imobiliaria-images';

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
AND policyname LIKE '%imobiliaria%';

-- 7. Comentários para documentação
COMMENT ON POLICY "Public Access Imobiliaria Images" ON storage.objects IS 'Permite acesso público às imagens do bucket imobiliaria-images';
COMMENT ON POLICY "Authenticated users can upload imobiliaria images" ON storage.objects IS 'Permite upload apenas para usuários autenticados no bucket imobiliaria-images';
COMMENT ON POLICY "Authenticated users can update imobiliaria images" ON storage.objects IS 'Permite atualização apenas para usuários autenticados no bucket imobiliaria-images';
COMMENT ON POLICY "Authenticated users can delete imobiliaria images" ON storage.objects IS 'Permite exclusão apenas para usuários autenticados no bucket imobiliaria-images';

-- 8. Teste de criação de arquivo (opcional - descomente se quiser testar)
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata)
-- VALUES ('imobiliaria-images', 'test/test.txt', auth.uid(), '{"size": 4, "mimetype": "text/plain"}');

-- 9. Limpar arquivo de teste (se foi criado)
-- DELETE FROM storage.objects 
-- WHERE bucket_id = 'imobiliaria-images' 
-- AND name = 'test/test.txt';

-- ✅ BUCKET CRIADO COM SUCESSO!
-- O bucket "imobiliaria-images" está pronto para uso com:
-- - Acesso público para leitura
-- - Upload/atualização/exclusão apenas para usuários autenticados
-- - Limite de 10MB por arquivo
-- - Tipos de arquivo permitidos: JPEG, JPG, PNG, WEBP
