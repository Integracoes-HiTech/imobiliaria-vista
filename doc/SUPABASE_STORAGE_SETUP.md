# Configuração do Supabase Storage para Imagens

## Problema: Falha no Upload de Imagens

### Solução Temporária (Modo Desenvolvimento)
O ImageService está configurado para usar URLs temporárias em modo de desenvolvimento. Isso permite testar o cadastro de imóveis sem configurar o Supabase Storage.

### Solução Definitiva (Produção)

#### 1. Configurar Bucket no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Vá para Storage**
   - No menu lateral, clique em "Storage"
   - Clique em "New bucket"

3. **Criar Bucket 'images'**
   - **Name**: `images`
   - **Public**: ✅ Marcado (para acesso público às imagens)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

#### 2. Configurar Políticas de Acesso

Execute este SQL no SQL Editor do Supabase:

```sql
-- Política para permitir upload de imagens (usuários autenticados)
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

-- Política para permitir atualização de imagens (usuários autenticados)
CREATE POLICY "Permitir atualização de imagens para usuários autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Política para permitir exclusão de imagens (usuários autenticados)
CREATE POLICY "Permitir exclusão de imagens para usuários autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

#### 3. Ativar Modo Produção

Após configurar o Supabase Storage, altere no arquivo `src/services/imageService.ts`:

```typescript
export class ImageService {
  // Modo de desenvolvimento - usar URLs temporárias
  private static readonly DEV_MODE = false; // ← Mudar para false
```

#### 4. Testar Upload

1. **Cadastre um novo imóvel**
2. **Adicione fotos**
3. **Verifique no console** se há erros
4. **Confirme se as imagens aparecem** nos cards

### Troubleshooting

#### Erro: "Bucket 'images' not found"
- Verifique se o bucket foi criado corretamente
- Confirme o nome exato: `images`

#### Erro: "Permission denied"
- Verifique se as políticas foram aplicadas
- Confirme se o usuário está autenticado

#### Erro: "File too large"
- Verifique o limite de tamanho do bucket
- Confirme se o arquivo não excede 10MB

#### Erro: "Invalid MIME type"
- Verifique se o tipo de arquivo é permitido
- Confirme se o arquivo é uma imagem válida

### Estrutura de Arquivos

```
Supabase Storage:
images/
├── properties/
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123456790-def456.jpg
│   └── ...
```

### URLs Geradas

As URLs das imagens serão no formato:
```
https://[projeto].supabase.co/storage/v1/object/public/images/properties/[nome-arquivo]
```

### Logs de Debug

O ImageService agora inclui logs detalhados:
- ✅ Início do upload
- ✅ Caminho do arquivo
- ✅ Status do upload
- ✅ URL gerada
- ✅ Erros detalhados

Verifique o console do navegador (F12) para ver os logs durante o upload.
