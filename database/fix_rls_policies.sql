-- Script para corrigir políticas RLS que estão causando recursão infinita
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos desabilitar temporariamente o RLS para corrigir as políticas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_status_history DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Only admin can modify users" ON users;
DROP POLICY IF EXISTS "Everyone can read properties" ON properties;
DROP POLICY IF EXISTS "Realtors can modify their own properties" ON properties;
DROP POLICY IF EXISTS "Everyone can read status history" ON property_status_history;
DROP POLICY IF EXISTS "Only admin can modify status history" ON property_status_history;

-- Recriar políticas mais simples e seguras
-- Política para usuários: todos podem ler, apenas admin pode modificar
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_modify_policy" ON users FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    )
);

-- Política para propriedades: todos podem ler, corretores podem modificar suas próprias
CREATE POLICY "properties_select_policy" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_modify_policy" ON properties FOR ALL USING (
    auth.uid() IS NOT NULL AND (
        realtor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND type = 'admin' 
            AND is_active = true
        )
    )
);

-- Política para histórico: todos podem ler, apenas admin pode modificar
CREATE POLICY "status_history_select_policy" ON property_status_history FOR SELECT USING (true);
CREATE POLICY "status_history_modify_policy" ON property_status_history FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    )
);

-- Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
