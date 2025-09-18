# Migração de Categoria de Imóveis

## Instruções para Adicionar Categoria no Banco de Dados

### 1. Execute a Migração no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o arquivo `add_category_migration.sql`

### 2. O que a Migração Faz

- ✅ Adiciona coluna `category` na tabela `properties`
- ✅ Define constraint para validar categorias válidas
- ✅ Cria índice para melhor performance
- ✅ Atualiza propriedades existentes com categorias baseadas no título
- ✅ Adiciona 5 novas propriedades de exemplo com diferentes categorias

### 3. Categorias Disponíveis

- `prontos` - Imóveis prontos para morar
- `na_planta` - Imóveis em construção/lançamento
- `apartamento` - Apartamentos
- `casa` - Casas e sobrados
- `cobertura` - Coberturas e penthouses
- `comercial` - Imóveis comerciais
- `condominio` - Casas em condomínio
- `loteamento` - Terrenos e lotes

### 4. Propriedades de Exemplo Adicionadas

1. **Lançamento Residencial Premium** (na_planta) - Goiânia
2. **Apartamento Pronto para Morar** (prontos) - Brasília
3. **Loja Comercial Centro** (comercial) - São Paulo
4. **Condomínio Residencial** (condominio) - Campinas
5. **Terreno para Loteamento** (loteamento) - Ribeirão Preto

### 5. Verificação

Após executar a migração, você pode verificar se funcionou:

```sql
-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'category';

-- Verificar as categorias das propriedades
SELECT id, title, category, status 
FROM properties 
ORDER BY category, title;
```

### 6. Impacto no Frontend

- ✅ Interface atualizada para usar categorias do banco
- ✅ Filtros mais precisos e rápidos
- ✅ Fallback para análise de texto (compatibilidade)
- ✅ Contadores de categoria funcionando corretamente

### 7. Próximos Passos

1. Execute a migração no Supabase
2. Teste a aplicação para verificar se as categorias estão funcionando
3. Adicione mais propriedades com categorias específicas
4. Atualize formulários de cadastro para incluir seleção de categoria
