-- SCRIPT URGENTE: Criar bucket de imagens
-- Execute este script AGORA no Supabase SQL Editor

-- 1. Criar o bucket 'images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se foi criado
SELECT 
  'SUCESSO: Bucket criado!' as status,
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'images';

-- Se aparecer uma linha com id='images', o bucket foi criado com sucesso!
