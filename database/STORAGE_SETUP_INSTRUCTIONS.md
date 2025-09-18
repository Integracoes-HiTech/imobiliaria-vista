# Configuração do Storage para Imagens

## Problema Identificado
As fotos dos imóveis não estão sendo cadastradas corretamente e não aparecem nos imóveis cadastrados.

## Solução

### 1. Configurar Bucket de Imagens no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script de Configuração**
   - Copie todo o conteúdo do arquivo `setup_storage.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

### 2. Verificar Configuração

Após executar o script, verifique se:

1. **Bucket foi criado**:
   - Vá para "Storage" no menu lateral
   - Deve aparecer um bucket chamado "images"

2. **Políticas foram aplicadas**:
   - No bucket "images", clique em "Policies"
   - Deve haver 4 políticas configuradas

### 3. Testar Upload de Imagens

1. **Cadastre um novo imóvel**:
   - Acesse `/admin/properties/new`
   - Preencha os dados obrigatórios
   - **Adicione fotos** usando o campo "Fotos do Imóvel"
   - Salve o imóvel

2. **Verifique se as fotos aparecem**:
   - Acesse `/properties` para ver a lista
   - As fotos devem aparecer nos cards dos imóveis

### 4. Estrutura do Storage

```
images/
├── properties/
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123456790-def456.jpg
│   └── ...
```

### 5. Troubleshooting

**Se as fotos ainda não aparecerem:**

1. **Verifique o console do navegador**:
   - Abra F12 → Console
   - Procure por erros relacionados ao upload

2. **Verifique as políticas do bucket**:
   - No Supabase Dashboard → Storage → images → Policies
   - Certifique-se de que as políticas estão ativas

3. **Teste o upload manualmente**:
   - No Supabase Dashboard → Storage → images
   - Tente fazer upload de uma imagem manualmente

### 6. Campos Adicionados

- ✅ **Categoria**: Campo obrigatório no cadastro de imóveis
- ✅ **Upload de imagens**: Suporte a até 5 fotos por imóvel
- ✅ **Validação**: Tipos de arquivo e tamanho limitados
- ✅ **Storage**: Bucket configurado com políticas de acesso

## Resultado Esperado

Após a configuração:
- ✅ Fotos são salvas no Supabase Storage
- ✅ URLs das fotos são salvas no banco de dados
- ✅ Fotos aparecem nos cards dos imóveis
- ✅ Upload funciona para usuários autenticados
- ✅ Visualização funciona para todos os usuários
