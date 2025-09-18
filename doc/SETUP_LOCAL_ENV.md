# 🔧 Configuração Local das Variáveis de Ambiente

## 🚨 Problema Identificado
As variáveis de ambiente não estão sendo carregadas localmente. Você precisa criar um arquivo `.env.local`.

## 📋 Passos para Resolver

### 1. **Criar arquivo `.env.local`**
Na raiz do projeto (mesmo nível do `package.json`), crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```env
# Configuração local do Supabase
VITE_SUPABASE_URL=https://knavbvrlstlkrljlyftx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_real_aqui
VITE_SUPABASE_SERVICE_KEY=sua_chave_service_real_aqui
```

### 2. **Obter as Chaves Reais do Supabase**
1. **Acesse**: [https://app.supabase.com/](https://app.supabase.com/)
2. **Selecione seu projeto**: `knavbvrlstlkrljlyftx`
3. **Vá em**: Settings → API
4. **Copie**:
   - **Project URL**: `https://knavbvrlstlkrljlyftx.supabase.co`
   - **anon public**: A chave pública (começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. **Substituir no arquivo `.env.local`**
Substitua `sua_chave_anon_real_aqui` pela chave real que você copiou do Supabase.

**Exemplo:**
```env
VITE_SUPABASE_URL=https://knavbvrlstlkrljlyftx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXZidnJsc3Rsa3Jsamx5ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzUyMDUsImV4cCI6MjA3MzUxMTIwNX0.SUA_CHAVE_REAL_AQUI
VITE_SUPABASE_SERVICE_KEY=sua_chave_service_real_aqui
```

### 4. **Reiniciar o Servidor de Desenvolvimento**
Após criar o arquivo `.env.local`:
1. Pare o servidor (`Ctrl+C`)
2. Execute novamente: `npm run dev` ou `yarn dev`

### 5. **Verificar se Funcionou**
Abra o console do navegador e você deve ver:
```javascript
🔧 Supabase Config Debug: {
  url: "https://knavbvrlstlkrljlyftx.supabase.co",
  hasAnonKey: true,
  anonKeyLength: 151, // ou outro número > 0
  env: "development",
  allEnvVars: {
    VITE_SUPABASE_URL: "https://knavbvrlstlkrljlyftx.supabase.co",
    VITE_SUPABASE_ANON_KEY: "***SET***",
    VITE_SUPABASE_SERVICE_KEY: "***SET***"
  }
}
```

## ⚠️ Importante

- **NÃO commite** o arquivo `.env.local` no git (ele já está no `.gitignore`)
- **Use apenas** para desenvolvimento local
- **Para produção** (Vercel), configure as variáveis no painel do Vercel

## 🎯 Próximo Passo

Após configurar o `.env.local` e reiniciar o servidor, me envie novamente os logs do console para verificar se a conexão está funcionando!
