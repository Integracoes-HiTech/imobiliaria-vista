-- Configuração do Supabase Storage para imagens
-- Execute este script no Supabase SQL Editor

-- Criar bucket para imagens (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir leitura pública das imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de imagens (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de imagens (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Função para gerar nome único de arquivo
CREATE OR REPLACE FUNCTION generate_unique_filename(original_name text)
RETURNS text AS $$
BEGIN
  RETURN extract(epoch from now())::bigint || '-' || encode(gen_random_bytes(8), 'hex') || '.' || split_part(original_name, '.', -1);
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON BUCKET images IS 'Bucket para armazenar imagens de propriedades';
COMMENT ON POLICY "Public Access" ON storage.objects IS 'Permite acesso público às imagens';
COMMENT ON POLICY "Authenticated users can upload images" ON storage.objects IS 'Permite upload apenas para usuários autenticados';
COMMENT ON POLICY "Authenticated users can update images" ON storage.objects IS 'Permite atualização apenas para usuários autenticados';
COMMENT ON POLICY "Authenticated users can delete images" ON storage.objects IS 'Permite exclusão apenas para usuários autenticados';
