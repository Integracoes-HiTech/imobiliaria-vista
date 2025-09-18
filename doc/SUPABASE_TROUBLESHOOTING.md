# 🔧 Guia Completo de Troubleshooting - Supabase

## 🚨 Problemas Comuns e Soluções

### 1. **❌ Variáveis de Ambiente Não Configuradas**

**Sintomas:**
- `hasAnonKey: false`
- `anonKeyLength: 0`
- `VITE_SUPABASE_ANON_KEY: "NOT_SET"`

**Soluções:**

#### Para Desenvolvimento Local:
1. Crie um arquivo `.env.local` na raiz do projeto:
```bash
# .env.local
VITE_SUPABASE_URL=https://knavbvrlstlkrljlyftx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_SUPABASE_SERVICE_KEY=sua_chave_service_aqui
```

2. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

#### Para Produção (Vercel):
1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em seu projeto → Settings → Environment Variables
3. Adicione as variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_KEY`
4. Faça redeploy

### 2. **❌ Chave Inválida ou Expirada**

**Sintomas:**
- `hasAnonKey: true` mas `anonKeyLength` é muito pequeno
- Erro: "Invalid JWT" ou "Invalid API key"
- Erro: "JWT expired"

**Soluções:**
1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Vá em Settings → API
3. Copie a chave **anon public** correta
4. Atualize no Vercel ou `.env.local`
5. Faça redeploy

### 3. **❌ Problemas de Permissão (RLS)**

**Sintomas:**
- Conexão OK mas `propertiesCount: 0`
- Erro: "permission denied" ou "RLS policy"
- `rlsEnabled: true` no debug

**Soluções:**

#### Opção 1: Desativar RLS temporariamente (para teste)
```sql
-- No SQL Editor do Supabase
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
```

#### Opção 2: Criar política pública
```sql
-- No SQL Editor do Supabase
CREATE POLICY "Permitir leitura pública" ON properties
FOR SELECT USING (true);
```

#### Opção 3: Verificar políticas existentes
```sql
-- No SQL Editor do Supabase
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename = 'properties';
```

### 4. **❌ Tabela Vazia ou Não Existe**

**Sintomas:**
- Conexão OK, sem erros
- `propertiesCount: 0`
- Erro: "relation 'properties' does not exist"

**Soluções:**

#### Verificar se a tabela existe:
```sql
-- No SQL Editor do Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'properties';
```

#### Verificar estrutura da tabela:
```sql
-- No SQL Editor do Supabase
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'properties';
```

#### Executar setup do banco:
```sql
-- Execute o arquivo database/schema.sql no SQL Editor
```

### 5. **❌ Problemas de Rede/CORS**

**Sintomas:**
- Erro: "Network Error" ou "CORS"
- Timeout nas requisições
- `duration` muito alto nos logs

**Soluções:**
1. Verifique sua conexão com a internet
2. Teste em outro navegador
3. Verifique se há firewall bloqueando
4. Teste em modo incógnito

### 6. **❌ Problemas de Autenticação**

**Sintomas:**
- Erro: "Invalid credentials"
- Erro: "User not found"
- Problemas no login

**Soluções:**
1. Verifique se o usuário existe na tabela `users`
2. Verifique se a senha está correta
3. Execute o setup de usuários:
```sql
-- No SQL Editor do Supabase
INSERT INTO users (id, name, email, phone, type, is_active, password_hash) 
VALUES (
  'admin-id', 
  'Admin', 
  'admin@imobiliaria.com', 
  '11999999999', 
  'admin', 
  true, 
  'hash_da_senha'
);
```

## 🔍 Como Debugar

### 1. **Verificar o Console do Navegador**
1. Abra a aplicação
2. Pressione `F12` para abrir DevTools
3. Vá na aba **Console**
4. Procure por logs que começam com:
   - `🔧 Supabase Config Debug:`
   - `🧪 SupabaseTest -`
   - `🔍 PropertyService -`

### 2. **Usar o Componente SupabaseTest**
O componente já está incluído na página inicial e mostra:
- ✅ Status da conexão
- ✅ Configuração válida
- ✅ Status do RLS
- ✅ Contagem de propriedades
- ✅ Variáveis de ambiente
- ✅ Último teste realizado

### 3. **Verificar Logs Detalhados**
Os serviços agora incluem logs detalhados com:
- Timestamp das operações
- Duração das requisições
- Detalhes dos erros
- Informações de debug

## 📋 Checklist de Verificação

### ✅ Configuração Básica
- [ ] URL do Supabase configurada
- [ ] Chave anon configurada
- [ ] Variáveis de ambiente carregadas
- [ ] Cliente Supabase inicializado

### ✅ Banco de Dados
- [ ] Tabela `properties` existe
- [ ] Tabela `users` existe
- [ ] Tabela `property_status_history` existe
- [ ] Dados de teste inseridos

### ✅ Permissões
- [ ] RLS configurado corretamente
- [ ] Políticas públicas criadas
- [ ] Usuários com permissões adequadas

### ✅ Rede
- [ ] Conexão com Supabase funcionando
- [ ] Sem problemas de CORS
- [ ] Tempo de resposta aceitável

## 🆘 Quando Pedir Ajuda

Se você ainda está com problemas, forneça:

1. **Logs do Console** (copie e cole)
2. **Screenshot do componente SupabaseTest**
3. **Informações do ambiente**:
   - Sistema operacional
   - Navegador usado
   - Se é local ou produção
4. **Passos que já tentou**

## 🗑️ Limpeza Após Resolver

Quando o problema for resolvido:

1. **Remover componente de debug**:
   - Remova `<SupabaseTest />` da `Home.tsx`
   - Delete o arquivo `SupabaseTest.tsx`

2. **Remover logs de debug**:
   - Comente ou remova os `console.log` dos serviços
   - Remova logs do `supabase.ts`

3. **Remover arquivos temporários**:
   - Delete este arquivo de troubleshooting
   - Delete arquivos `.env.local` se criados

## 📞 Suporte Adicional

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Troubleshooting Supabase](https://supabase.com/docs/guides/platform/troubleshooting)
