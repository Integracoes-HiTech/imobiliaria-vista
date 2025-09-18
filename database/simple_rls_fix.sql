-- Solução mais simples: desabilitar RLS temporariamente para permitir acesso público
-- Execute este script no Supabase SQL Editor se o anterior não funcionar

-- Desabilitar RLS completamente para permitir acesso público
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_status_history DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Only admin can modify users" ON users;
DROP POLICY IF EXISTS "Everyone can read properties" ON properties;
DROP POLICY IF EXISTS "Realtors can modify their own properties" ON properties;
DROP POLICY IF EXISTS "Everyone can read status history" ON property_status_history;
DROP POLICY IF EXISTS "Only admin can modify status history" ON property_status_history;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_modify_policy" ON users;
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
DROP POLICY IF EXISTS "properties_modify_policy" ON properties;
DROP POLICY IF EXISTS "status_history_select_policy" ON property_status_history;
DROP POLICY IF EXISTS "status_history_modify_policy" ON property_status_history;

-- Verificar se RLS está desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'properties', 'property_status_history');
