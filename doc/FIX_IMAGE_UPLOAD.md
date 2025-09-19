# Correção do Problema de Upload de Imagens

## Problema Identificado
O upload de imagens está falhando com erro. Isso geralmente acontece por problemas de configuração do Supabase Storage.

## Solução Passo a Passo

### 1. Execute o Script de Diagnóstico
Acesse `/test-upload` no navegador para executar diagnósticos automáticos.

### 2. Configure o Supabase Storage

#### Opção A: Script Automático (se tiver permissões)
Execute o script `database/fix_storage_simple.sql` no Supabase SQL Editor.

#### Opção B: Configuração Manual (recomendado)
Se receber erro de permissões, configure manualmente:

1. **Acesse o Supabase Dashboard**
2. **Vá para Storage > Settings**
3. **Execute o script** `database/create_bucket_only.sql` (apenas cria o bucket)
4. **Configure as políticas manualmente** no Dashboard:

   **No Supabase Dashboard:**
   - Vá para **Storage > Settings**
   - Clique em **"New Policy"** para o bucket 'images'
   - Crie estas 4 políticas:

   **Política 1 - SELECT (Leitura Pública):**
   - Name: `Public Access Images`
   - Operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'images'`

   **Política 2 - INSERT (Upload):**
   - Name: `Authenticated Upload Images`
   - Operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'images'`

   **Política 3 - UPDATE (Atualização):**
   - Name: `Authenticated Update Images`
   - Operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'images'`

   **Política 4 - DELETE (Exclusão):**
   - Name: `Authenticated Delete Images`
   - Operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'images'`

### 3. Verificações Manuais

#### A. Verificar se o bucket existe:
```sql
SELECT * FROM storage.buckets WHERE id = 'images';
```

#### B. Verificar políticas:
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%images%';
```

#### C. Testar upload manual:
```sql
-- Criar um arquivo de teste
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('images', 'test.txt', auth.uid(), '{"size": 4}');
```

### 4. Possíveis Causas e Soluções

#### ❌ Bucket não existe
**Solução:** Execute o script de configuração
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

#### ❌ Políticas incorretas
**Solução:** Recriar políticas
```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

-- Criar políticas corretas
CREATE POLICY "Public Access Images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

#### ❌ Bucket não é público
**Solução:** Tornar bucket público
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images';
```

#### ❌ Problemas de autenticação
**Solução:** Verificar se o usuário está logado
- Faça login como admin ou corretor
- Verifique se as credenciais estão corretas

### 5. Teste o Upload

Após executar as correções:

1. **Acesse** `/admin/properties/new` ou `/realtor/properties/new`
2. **Preencha** os dados do imóvel
3. **Adicione** uma ou mais imagens
4. **Salve** o imóvel
5. **Verifique** se as imagens aparecem corretamente

### 6. Logs de Debug

Abra o console do navegador (F12) e procure por:

#### ✅ Upload funcionando:
```
🖼️ ImageService - Iniciando upload da imagem: foto.jpg Tamanho: 2048576
🔍 ImageService - Verificando bucket...
✅ ImageService - Bucket encontrado: {id: "images", name: "images", public: true}
⬆️ ImageService - Fazendo upload para Supabase Storage...
✅ ImageService - Upload realizado com sucesso: {path: "properties/1703123456789-abc123.jpg"}
🔗 ImageService - URL pública gerada: https://[projeto].supabase.co/storage/v1/object/public/images/properties/1703123456789-abc123.jpg
```

#### ❌ Upload com erro:
```
❌ ImageService - Erro ao fazer upload da imagem: StorageError
❌ ImageService - Detalhes do erro: {message: "The resource was not found", name: "StorageError"}
```

### 7. Troubleshooting Avançado

#### Se ainda não funcionar:

1. **Verifique as credenciais do Supabase:**
   - URL do projeto
   - Chave anônima (anon key)
   - Chave de serviço (service key)

2. **Verifique as permissões RLS:**
   ```sql
   -- Verificar se RLS está habilitado
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```

3. **Teste com usuário admin:**
   - Faça login como admin
   - Tente fazer upload
   - Verifique se as permissões estão corretas

### 8. Limpeza

Após resolver o problema, você pode:

1. **Remover a rota de teste:**
   - Remover `/test-upload` do `App.tsx`
   - Deletar `ImageUploadTest.tsx`

2. **Limpar arquivos de teste:**
   ```sql
   DELETE FROM storage.objects 
   WHERE bucket_id = 'images' 
   AND name LIKE 'test%';
   ```

## Contato

Se o problema persistir, verifique:
- Logs do console do navegador
- Logs do Supabase Dashboard
- Configurações de rede/firewall
