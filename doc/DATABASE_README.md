# Configuração do Banco de Dados - MG Imóveis

## Instruções para Configurar o Supabase

### 1. Acesse o Supabase Dashboard
- Vá para [https://supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto: `knavbvrlstlkrljlyftx`

### 2. Execute o Schema SQL
1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar

### 3. Verificar as Tabelas Criadas
Após executar o schema, você deve ter as seguintes tabelas:
- `users` - Usuários (admin e corretores)
- `properties` - Propriedades/imóveis
- `property_status_history` - Histórico de mudanças de status

### 4. Dados de Teste Inseridos
O schema já inclui dados de teste:
- **Admin**: admin@mgimoveis.com / senha: admin123
- **Corretores**: 
  - ana.silva@mgimoveis.com / senha: ana123
  - carlos.mendes@mgimoveis.com / senha: carlos123
  - marina.costa@mgimoveis.com / senha: marina123
  - joao.santos@mgimoveis.com / senha: joao123

### 5. Configurar Variáveis de Ambiente (Opcional)
Se quiser usar variáveis de ambiente, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://knavbvrlstlkrljlyftx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 6. Testar a Conexão
Após configurar tudo:
1. Execute `npm run dev`
2. Acesse a aplicação
3. Tente fazer login com os dados de teste
4. Verifique se os dados estão sendo carregados do banco

## Estrutura das Tabelas

### users
- `id` - ID único (serial)
- `name` - Nome completo
- `email` - Email único
- `phone` - Telefone único
- `birth_date` - Data de nascimento (opcional)
- `type` - Tipo: 'admin' ou 'realtor'
- `is_active` - Status ativo/inativo
- `password_hash` - Hash da senha
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### properties
- `id` - ID único (serial)
- `title` - Título do imóvel
- `description` - Descrição detalhada
- `price` - Preço (decimal)
- `price_formatted` - Preço formatado (string)
- `location` - Localização
- `state` - Estado (sigla)
- `images` - Array de URLs das imagens
- `realtor_id` - ID do corretor responsável
- `status` - Status: 'available', 'negotiating', 'sold'
- `address` - Endereço completo (JSON)
- `features` - Características (JSON)
- `registration_date` - Data de registro
- `internal_notes` - Observações internas
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### property_status_history
- `id` - ID único (serial)
- `property_id` - ID da propriedade
- `status` - Status alterado
- `changed_by` - Quem alterou
- `changed_at` - Quando alterou
- `notes` - Observações da mudança
- `created_at` - Data de criação

## Políticas de Segurança (RLS)

O sistema implementa Row Level Security com as seguintes políticas:

- **Usuários**: Todos podem ler, apenas admin pode modificar
- **Propriedades**: Todos podem ler, corretores podem modificar suas próprias propriedades
- **Histórico**: Todos podem ler, apenas admin pode modificar

## Próximos Passos

1. Execute o schema SQL no Supabase
2. Teste o login com os dados de exemplo
3. Verifique se os dados estão sendo carregados corretamente
4. Configure as políticas de segurança conforme necessário
5. Implemente autenticação JWT se necessário
