# 🆕 Configuração do Novo Bucket "imobiliaria-images"

## 📋 Resumo das Alterações

Criamos um novo bucket chamado **"imobiliaria-images"** para organizar melhor o upload de imagens dos imóveis. Este bucket tem configurações específicas e otimizadas para o seu projeto.

## 🚀 Passo a Passo para Configurar

### 1. Execute o Script no Supabase

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script**: `database/create_new_bucket_imobiliaria.sql`

Este script irá:
- ✅ Criar o bucket "imobiliaria-images"
- ✅ Configurar permissões públicas para leitura
- ✅ Configurar permissões de upload apenas para usuários autenticados
- ✅ Definir limite de 10MB por arquivo
- ✅ Permitir apenas tipos: JPEG, JPG, PNG, WEBP

### 2. Teste o Novo Bucket

1. **Acesse**: `http://localhost:5173/test-new-bucket`
2. **Clique em "Verificar Bucket"** para confirmar que foi criado
3. **Selecione uma imagem** e clique em "Testar Upload"
4. **Verifique se a URL é gerada corretamente**

### 3. Verificação Manual (Opcional)

Se quiser verificar manualmente no Supabase:

```sql
-- Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE id = 'imobiliaria-images';

-- Verificar as políticas
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%imobiliaria%';
```

## 🔧 Alterações Realizadas no Código

### 1. Serviço de Imagens Atualizado
- ✅ `src/services/imageService.ts` agora usa o bucket "imobiliaria-images"
- ✅ Todas as funções de upload, download e exclusão atualizadas
- ✅ URLs públicas geradas corretamente

### 2. Componente de Teste Criado
- ✅ `src/components/NewBucketTest.tsx` para testar o novo bucket
- ✅ Rota `/test-new-bucket` adicionada ao App.tsx
- ✅ Interface para verificar bucket e testar upload

## 📁 Estrutura do Novo Bucket

```
imobiliaria-images/
├── properties/          # Imagens dos imóveis
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123456790-def456.png
│   └── ...
├── realtors/           # Fotos dos corretores (futuro)
└── test/              # Arquivos de teste (temporário)
```

## 🌐 URLs Geradas

As URLs das imagens terão o formato:
```
https://[seu-projeto].supabase.co/storage/v1/object/public/imobiliaria-images/properties/1703123456789-abc123.jpg
```

## ✅ Vantagens do Novo Bucket

1. **Organização**: Nome específico para o projeto
2. **Configurações Otimizadas**: Limites e tipos de arquivo adequados
3. **Permissões Corretas**: Acesso público para leitura, upload apenas para autenticados
4. **URLs Limpas**: URLs organizadas e previsíveis
5. **Facilidade de Manutenção**: Bucket dedicado apenas para este projeto

## 🧪 Como Testar

### Teste Completo:
1. Execute o script SQL no Supabase
2. Acesse `/test-new-bucket`
3. Verifique se o bucket existe
4. Faça upload de uma imagem
5. Verifique se a URL é gerada
6. Teste criar um novo imóvel com imagem

### Teste de Upload de Imóvel:
1. Acesse `/admin/properties/new` ou `/realtor/properties/new`
2. Preencha os dados do imóvel
3. Adicione uma ou mais imagens
4. Salve o imóvel
5. Verifique se as imagens aparecem corretamente

## 🔍 Logs de Debug

Abra o console do navegador (F12) para ver os logs detalhados:

### ✅ Upload Funcionando:
```
🖼️ ImageService - Iniciando upload da imagem: foto.jpg Tamanho: 2048576
🔍 ImageService - Verificando bucket...
✅ ImageService - Bucket encontrado: {id: "imobiliaria-images", name: "imobiliaria-images", public: true}
⬆️ ImageService - Fazendo upload para Supabase Storage...
✅ ImageService - Upload realizado com sucesso: {path: "properties/1703123456789-abc123.jpg"}
🔗 ImageService - URL pública gerada: https://[projeto].supabase.co/storage/v1/object/public/imobiliaria-images/properties/1703123456789-abc123.jpg
```

### ❌ Problemas Comuns:

**Bucket não encontrado:**
```
❌ ImageService - Bucket "imobiliaria-images" não encontrado
```
**Solução**: Execute o script SQL de criação do bucket

**Erro de permissão:**
```
❌ ImageService - Erro ao fazer upload da imagem: StorageError
```
**Solução**: Verifique se as políticas foram criadas corretamente

## 🧹 Limpeza

Após confirmar que tudo está funcionando:

1. **Remover arquivos de teste:**
   - Use o botão "Limpar Testes" no componente de teste
   - Ou execute: `/test-new-bucket` e clique em "Limpar Testes"

2. **Remover rota de teste (opcional):**
   - Remover a linha do `App.tsx`: `<Route path="/test-new-bucket" element={<NewBucketTest />} />`
   - Deletar o arquivo `src/components/NewBucketTest.tsx`

## 🆘 Solução de Problemas

### Problema: Bucket não é criado
**Solução**: Verifique se você tem permissões de administrador no Supabase

### Problema: Upload falha com erro de permissão
**Solução**: Execute novamente o script SQL ou configure as políticas manualmente no Dashboard

### Problema: URLs não funcionam
**Solução**: Verifique se o bucket está marcado como público (`public = true`)

### Problema: Imagens não aparecem nos imóveis
**Solução**: Verifique se o `ImageService` está usando o bucket correto

## 📞 Próximos Passos

Após configurar o novo bucket:

1. ✅ Teste o upload de imagens
2. ✅ Crie alguns imóveis com fotos
3. ✅ Verifique se as imagens aparecem corretamente
4. ✅ Teste em diferentes dispositivos/navegadores
5. ✅ Configure backup/monitoramento se necessário

---

**🎉 Parabéns! Seu novo bucket "imobiliaria-images" está pronto para uso!**
