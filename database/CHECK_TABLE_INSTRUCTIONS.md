# 🔍 Verificação da Estrutura da Tabela Properties

## 🎯 Objetivo
Verificar se a tabela `properties` está configurada corretamente e se a coluna `category` existe.

## 📋 Passos para Executar

### 1. Acesse o Supabase Dashboard
1. **Vá para**: `https://app.supabase.com/`
2. **Selecione seu projeto**: `knavbvrlstlkrljlyftx`
3. **Navegue para**: `SQL Editor` (no menu lateral)

### 2. Execute o Script de Verificação
1. **Clique em**: `New query`
2. **Cole o conteúdo** do arquivo `database/check_properties_table.sql`
3. **Execute**: Clique em `Run`

### 3. Verifique os Resultados

#### ✅ **Resultados Esperados:**

**1. Tabela existe:**
```
table_exists: true
```

**2. Estrutura da tabela deve incluir:**
```
column_name     | data_type | is_nullable | column_default
----------------|-----------|-------------|---------------
id              | uuid      | NO          | gen_random_uuid()
title           | text      | NO          | 
description     | text      | NO          | 
price           | numeric   | NO          | 
price_formatted | text      | NO          | 
location        | text      | NO          | 
state           | text      | NO          | 
images          | text[]    | YES         | 
realtor_id      | uuid      | NO          | 
status          | text      | NO          | 
category        | text      | YES         | 
address         | jsonb     | NO          | 
features        | jsonb     | NO          | 
registration_date | date    | NO          | 
internal_notes  | text      | YES         | 
created_at      | timestamp | NO          | now()
updated_at      | timestamp | NO          | now()
```

**3. Coluna category existe:**
```
category_column_exists: true
```

**4. Registros de exemplo:**
```
id                                   | title                    | category    | status     | created_at
-------------------------------------|--------------------------|-------------|------------|------------------
d97b8f08-db7a-4f99-81e9-a39376346a88| Apartamento Luxo         | apartamento | available  | 2024-01-15 10:30:00
```

## ⚠️ **Problemas Possíveis:**

### **Problema 1: Coluna 'category' não existe**
**Solução**: Execute a migração de categoria:
```sql
-- Adicionar coluna category se não existir
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'apartamento';

-- Atualizar registros existentes
UPDATE properties 
SET category = 'apartamento' 
WHERE category IS NULL;
```

### **Problema 2: Tabela não existe**
**Solução**: Execute o script de criação da tabela:
```sql
-- Execute o conteúdo do arquivo database/schema.sql
```

### **Problema 3: Dados não encontrados**
**Solução**: Verifique se há dados na tabela:
```sql
SELECT COUNT(*) FROM properties;
```

## 🔧 **Próximos Passos:**

1. **Se tudo estiver OK**: O problema pode estar na aplicação
2. **Se houver problemas**: Execute as correções necessárias
3. **Teste novamente**: Acesse `http://localhost:8080/property/d97b8f08-db7a-4f99-81e9-a39376346a88`

## 📞 **Suporte:**

Se ainda houver problemas após executar este script, verifique:
- ✅ **Console do navegador**: F12 → Console
- ✅ **Logs da aplicação**: Terminal onde roda `npm run dev`
- ✅ **Rede**: Aba Network no DevTools

---

**Execute este script e me informe os resultados para continuarmos o debug!**
