# 🔍 Debug da Conexão Supabase

## 🚨 Problema Identificado
As variáveis de ambiente foram configuradas no Vercel, mas os dados ainda não estão sendo carregados.

## 🧪 Componente de Debug Adicionado

Adicionei um componente de teste (`SupabaseTest`) na página inicial que vai mostrar:
- ✅ Status da conexão
- ✅ Se as variáveis estão configuradas
- ✅ Quantas propriedades existem no banco
- ✅ Mensagens de erro detalhadas

## 📋 Passos para Debugar

### 1. **Verificar o Console do Navegador**
1. Abra a aplicação no Vercel
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **Console**
4. Procure por logs que começam com:
   - `🔧 Supabase Config Debug:`
   - `🧪 SupabaseTest -`
   - `🔍 PropertyService -`

### 2. **Verificar as Variáveis de Ambiente**
No console, você deve ver algo como:
```javascript
🔧 Supabase Config Debug: {
  url: "https://knavbvrlstlkrljlyftx.supabase.co",
  hasAnonKey: true,
  anonKeyLength: 151, // ou outro número
  env: "production",
  allEnvVars: {
    VITE_SUPABASE_URL: "https://knavbvrlstlkrljlyftx.supabase.co",
    VITE_SUPABASE_ANON_KEY: "***SET***",
    VITE_SUPABASE_SERVICE_KEY: "***SET***"
  }
}
```

### 3. **Possíveis Problemas e Soluções**

#### ❌ **Problema 1: Variáveis não configuradas**
**Sintomas:**
- `hasAnonKey: false`
- `anonKeyLength: 0`
- `VITE_SUPABASE_ANON_KEY: "NOT_SET"`

**Solução:**
1. Vá no Vercel → Settings → Environment Variables
2. Verifique se `VITE_SUPABASE_ANON_KEY` está configurada
3. Faça redeploy

#### ❌ **Problema 2: Chave inválida**
**Sintomas:**
- `hasAnonKey: true` mas `anonKeyLength` é muito pequeno
- Erro: "Invalid JWT" ou "Invalid API key"

**Solução:**
1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Vá em Settings → API
3. Copie a chave **anon public** correta
4. Atualize no Vercel
5. Faça redeploy

#### ❌ **Problema 3: Permissões RLS (Row Level Security)**
**Sintomas:**
- Conexão OK mas `dataLength: 0`
- Erro: "permission denied" ou "RLS policy"

**Solução:**
1. No Supabase Dashboard → Authentication → Policies
2. Verifique se a tabela `properties` tem políticas públicas
3. Ou desative temporariamente o RLS para teste

#### ❌ **Problema 4: Tabela vazia**
**Sintomas:**
- Conexão OK, sem erros
- `propertiesCount: 0`

**Solução:**
1. Verifique se há dados na tabela `properties`
2. Execute: `SELECT COUNT(*) FROM properties;` no SQL Editor

## 🔧 Comandos SQL para Verificar

Execute estes comandos no **SQL Editor** do Supabase:

```sql
-- 1. Verificar se a tabela existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'properties';

-- 2. Contar propriedades
SELECT COUNT(*) as total_properties FROM properties;

-- 3. Verificar estrutura da tabela
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'properties';

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename = 'properties';
```

## 📞 Próximos Passos

1. **Execute a aplicação** e verifique o console
2. **Copie os logs** que aparecem no console
3. **Me envie os logs** para eu ajudar a identificar o problema específico

## 🗑️ Remover Debug Após Resolver

Quando o problema for resolvido, remova:
1. O componente `<SupabaseTest />` da `Home.tsx`
2. Os logs de debug do `supabase.ts` e `propertyService.ts`
3. Este arquivo de instruções
