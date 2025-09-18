# Correção das URLs Blob no Banco de Dados

## Problema Identificado
As imagens estão sendo salvas como URLs `blob:` no banco de dados:
```json
[
  "blob:http://localhost:8080/b7128f7c-1729-4269-a73a-bc8bebfd8ba3",
  "blob:http://localhost:8080/a6b75381-1266-4a93-b717-cd679b86ea57"
]
```

## Causa do Problema
O `DEV_MODE` estava ativo no `ImageService`, fazendo com que URLs temporárias fossem salvas no banco.

## Solução

### 1. Corrigir o ImageService
✅ **Já corrigido**: `DEV_MODE = false` em `src/services/imageService.ts`

### 2. Limpar URLs Blob do Banco
Execute o script `fix_blob_urls.sql` no Supabase:

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script** `fix_blob_urls.sql`
4. **Verifique os resultados**

### 3. Testar Upload Real
Agora quando cadastrar um novo imóvel:

1. **As imagens serão enviadas** para o Supabase Storage
2. **URLs públicas serão geradas** no formato:
   ```
   https://[projeto].supabase.co/storage/v1/object/public/images/properties/[arquivo]
   ```
3. **URLs serão salvas** no banco de dados

### 4. Verificar Resultado
Após executar o script, as propriedades devem ter:
```json
[
  "property1.jpg"
]
```

## Como Testar

### 1. Cadastre um Novo Imóvel
1. Acesse `/admin/properties/new`
2. Preencha os dados
3. Adicione fotos
4. Salve o imóvel

### 2. Verifique os Logs
No console do navegador, deve aparecer:
```
Iniciando upload da imagem: foto.jpg Tamanho: 2048576
Caminho do arquivo: properties/1703123456789-abc123.jpg
Fazendo upload para Supabase Storage...
Upload realizado com sucesso: {path: "properties/...", id: "..."}
URL pública gerada: https://[projeto].supabase.co/storage/v1/object/public/images/properties/...
```

### 3. Verifique no Banco
As imagens devem ser salvas como:
```json
[
  "https://[projeto].supabase.co/storage/v1/object/public/images/properties/1703123456789-abc123.jpg"
]
```

## Troubleshooting

### Se ainda aparecer URLs blob:
1. **Verifique se o script foi executado**
2. **Confirme se DEV_MODE = false**
3. **Teste com um novo imóvel**

### Se o upload falhar:
1. **Verifique se o bucket 'images' existe**
2. **Confirme se as políticas estão ativas**
3. **Verifique os logs de erro no console**

### Se as imagens não aparecerem:
1. **Verifique se as URLs são válidas**
2. **Teste acessar a URL diretamente**
3. **Confirme se o bucket é público**

## Resultado Esperado

Após a correção:
- ✅ **URLs blob removidas** do banco
- ✅ **Imagens padrão** para propriedades antigas
- ✅ **Upload real** para novas propriedades
- ✅ **URLs públicas** do Supabase Storage
- ✅ **Imagens funcionando** nos cards
