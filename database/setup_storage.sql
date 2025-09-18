-- Configuração do Storage para imagens no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para imagens (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de acesso para o bucket 'images'

-- Política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir upload de imagens para usuários autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Política para permitir visualização pública de imagens
CREATE POLICY "Permitir visualização pública de imagens"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- Política para permitir atualização de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir atualização de imagens para usuários autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Política para permitir exclusão de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir exclusão de imagens para usuários autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Verificar se o bucket foi criado corretamente
SELECT * FROM storage.buckets WHERE id = 'images';
