# 🔑 Como Obter as Chaves do Supabase

## 📋 Passo a Passo:

### 1. **Acesse o Supabase Dashboard**
- Vá para: https://app.supabase.com/
- Faça login na sua conta

### 2. **Selecione seu Projeto**
- Clique no projeto: `knavbvrlstlkrljlyftx`

### 3. **Vá para Settings → API**
- No menu lateral, clique em **Settings**
- Depois clique em **API**

### 4. **Copie as Chaves**
Você verá duas seções importantes:

#### **Project URL** (já temos):
```
https://knavbvrlstlkrljlyftx.supabase.co
```

#### **Project API keys**:
- **anon public**: Esta é a chave que precisamos!
- **service_role**: Para operações administrativas

### 5. **Adicione ao arquivo .env.local**

Abra o arquivo `.env.local` que foi criado e adicione:

```bash
# URL do Supabase (já configurada)
VITE_SUPABASE_URL=https://knavbvrlstlkrljlyftx.supabase.co

# Chave anon public (COPIE AQUI A CHAVE ANON)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave service role (opcional para desenvolvimento)
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. **Reinicie o servidor**
```bash
npm run dev
```

## ⚠️ **Importante:**
- A chave **anon public** é segura para usar no frontend
- A chave **service_role** é mais poderosa, use com cuidado
- NUNCA commite o arquivo `.env.local` no Git

## 🔍 **Como identificar a chave correta:**
- A chave anon geralmente começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- Tem cerca de 150+ caracteres
- Está na seção "Project API keys" → "anon public"
