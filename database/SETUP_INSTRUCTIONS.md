# 🚀 Instruções de Configuração - MG Imóveis

## ⚠️ CORREÇÃO IMPORTANTE: UUID vs INTEGER

O erro `ERROR: 42846: cannot cast type uuid to integer` foi corrigido! 

### ✅ O que foi alterado:

1. **Schema SQL atualizado** - Todos os IDs agora usam UUID em vez de INTEGER
2. **Tipos TypeScript corrigidos** - Interfaces atualizadas para usar `string` em vez de `number`
3. **Serviços atualizados** - Todos os métodos agora trabalham com UUIDs
4. **Dados mock atualizados** - IDs convertidos para UUIDs válidos

## 📋 Passos para Configurar

### 1. Execute o Script de Reset (RECOMENDADO)
```sql
-- Execute o arquivo database/reset_and_setup.sql no Supabase SQL Editor
-- Este script deleta tudo e recria do zero com UUIDs corretos
```

### 2. OU Execute o Schema Atualizado
```sql
-- Execute o arquivo database/schema.sql no Supabase SQL Editor
-- Certifique-se de que não há tabelas existentes com tipos incorretos
```

### 3. Verifique a Conexão
- Acesse: `http://localhost:8081/test-db`
- Clique em "Testar Conexão"
- Deve mostrar sucesso com dados de teste

### 4. Teste o Login
Use estas credenciais:
- **Admin**: admin@mgimoveis.com / admin123
- **Corretor**: ana.silva@mgimoveis.com / ana123

## 🔧 Principais Correções

### Schema SQL
```sql
-- ANTES (causava erro)
id SERIAL PRIMARY KEY,
realtor_id INTEGER NOT NULL REFERENCES users(id)

-- DEPOIS (corrigido)
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
realtor_id UUID NOT NULL REFERENCES users(id)
```

### TypeScript
```typescript
// ANTES
interface User {
  id: number;
}

// DEPOIS
interface User {
  id: string;
}
```

### Dados Mock
```typescript
// ANTES
id: 1,

// DEPOIS
id: "550e8400-e29b-41d4-a716-446655440001",
```

## 🎯 Próximos Passos

1. ✅ Execute o schema SQL corrigido
2. ✅ Teste a conexão em `/test-db`
3. ✅ Faça login com dados de teste
4. ✅ Verifique se os dados carregam corretamente

## 🐛 Se ainda houver problemas

1. **Limpe o cache do navegador**
2. **Reinicie o servidor**: `npm run dev`
3. **Verifique o console** para erros específicos
4. **Confirme que o schema foi executado** no Supabase

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do console
2. Teste a conexão em `/test-db`
3. Confirme que todas as tabelas foram criadas no Supabase

O sistema agora está completamente compatível com UUIDs! 🎉
