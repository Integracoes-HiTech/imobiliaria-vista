-- Script mínimo para criar apenas o bucket
-- Execute este script no Supabase SQL Editor

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criado
SELECT 
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'images';
