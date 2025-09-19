# 🚨 URGENTE: Criar Bucket de Imagens

## O Problema
O erro mostra que o bucket "images" não existe no Supabase:
```
❌ ImageService - Bucket "images" não encontrado
❌ ImageService - Erro no upload da imagem: Error: Bucket "images" não existe
```

## Solução IMEDIATA

### Passo 1: Acessar o Supabase
1. **Abra** o Supabase Dashboard no navegador
2. **Faça login** na sua conta
3. **Selecione** o projeto da imobiliária

### Passo 2: Executar o Script SQL
1. **Clique** em "SQL Editor" no menu lateral
2. **Cole** este código no editor:

```sql
-- Criar bucket de imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criado
SELECT 
  'SUCESSO: Bucket criado!' as status,
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE id = 'images';
```

3. **Clique** em "Run" para executar
4. **Verifique** se aparece uma linha com `id='images'`

### Passo 3: Configurar Políticas (IMPORTANTE)
Após criar o bucket, configure as políticas:

1. **Vá para** Storage > Settings no Dashboard
2. **Clique** em "New Policy" para o bucket 'images'
3. **Crie** estas políticas:

#### Política 1 - SELECT (Leitura Pública):
- **Name:** `Public Access Images`
- **Operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'images'`

#### Política 2 - INSERT (Upload):
- **Name:** `Authenticated Upload Images`
- **Operation:** `INSERT`
- **Target roles:** `authenticated`
- **WITH CHECK expression:** `bucket_id = 'images'`

#### Política 3 - UPDATE (Atualização):
- **Name:** `Authenticated Update Images`
- **Operation:** `UPDATE`
- **Target roles:** `authenticated`
- **USING expression:** `bucket_id = 'images'`

#### Política 4 - DELETE (Exclusão):
- **Name:** `Authenticated Delete Images`
- **Operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:** `bucket_id = 'images'`

### Passo 4: Testar o Upload
1. **Volte** para a aplicação
2. **Acesse** `/test-upload` para testar
3. **Ou tente** cadastrar um imóvel com imagens

## Verificação Rápida

### ✅ Se funcionou:
- Bucket aparece na lista de buckets
- Upload de imagens funciona
- Imagens aparecem nos imóveis

### ❌ Se ainda não funcionar:
- Verifique se executou o script SQL
- Confirme se criou as 4 políticas
- Teste com `/test-upload` primeiro

## Arquivo de Script
Use o arquivo `database/CREATE_BUCKET_NOW.sql` que contém o script completo.

---

**IMPORTANTE:** Execute o script SQL AGORA para resolver o problema de upload!
