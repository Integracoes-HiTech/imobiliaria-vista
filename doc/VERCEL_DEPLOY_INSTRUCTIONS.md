# 🚀 Guia de Deploy no Vercel

## 📋 Passos para Configurar

### 1. Obter as Chaves Corretas do Supabase

1. **Acesse**: [https://app.supabase.com/](https://app.supabase.com/)
2. **Selecione seu projeto**: `knavbvrlstlkrljlyftx`
3. **Vá em**: Settings → API
4. **Copie**:
   - **Project URL**: `https://knavbvrlstlkrljlyftx.supabase.co`
   - **anon public**: A chave pública (começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Configurar Variáveis no Vercel

1. **Acesse**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Selecione seu projeto**
3. **Vá em**: Settings → Environment Variables
4. **Adicione as seguintes variáveis**:

```
VITE_SUPABASE_URL = https://knavbvrlstlkrljlyftx.supabase.co
VITE_SUPABASE_ANON_KEY = [sua_chave_anon_real_aqui]
```

**⚠️ IMPORTANTE**: Substitua `[sua_chave_anon_real_aqui]` pela chave real do seu Supabase!

### 3. Fazer Redeploy

1. **Vá em**: Deployments
2. **Clique nos 3 pontinhos** do último deploy
3. **Selecione**: Redeploy

## 🔧 Arquivos Modificados

- ✅ `src/config/supabase.ts` - Agora usa variáveis de ambiente
- ✅ Criado este guia de instruções

## 🐛 Problema Identificado

O problema era que a chave anon estava como `example_key_here` (inválida). Agora o sistema usa variáveis de ambiente que devem ser configuradas no Vercel.

## 📝 Exemplo de Chave Anon

Uma chave anon válida se parece com:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXZidnJsc3Rsa3Jsamx5ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzUyMDUsImV4cCI6MjA3MzUxMTIwNX0.SUA_CHAVE_REAL_AQUI
```

## ✅ Verificação

Após configurar as variáveis e fazer redeploy, verifique se:
1. A aplicação carrega sem erros
2. Os dados dos imóveis aparecem
3. O login funciona
4. As imagens carregam corretamente
