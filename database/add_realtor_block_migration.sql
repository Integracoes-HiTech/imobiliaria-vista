-- Migração para adicionar bloqueio lógico na tabela users (corretores)
-- Execute este script no Supabase SQL Editor

-- Adicionar campo blocked_at na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Criar índice para melhor performance nas consultas de bloqueio
CREATE INDEX IF NOT EXISTS idx_users_blocked_at ON users(blocked_at);

-- Atualizar políticas RLS para considerar bloqueio
-- Remover política antiga
DROP POLICY IF EXISTS "Users can read all users" ON users;

-- Criar nova política que exclui usuários bloqueados
CREATE POLICY "Users can read active users" ON users FOR SELECT USING (
    blocked_at IS NULL
);

-- Manter política de modificação existente (já considera bloqueio)
-- CREATE POLICY "Only admin can modify users" ON users FOR ALL USING (
--     EXISTS (
--         SELECT 1 FROM users 
--         WHERE id = auth.uid() 
--         AND type = 'admin' 
--         AND is_active = true
--     )
-- );

-- Função para bloquear corretor
CREATE OR REPLACE FUNCTION block_realtor(realtor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário existe, não está bloqueado e é corretor
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = realtor_id 
        AND blocked_at IS NULL
        AND type = 'realtor'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Marcar como bloqueado
    UPDATE users 
    SET blocked_at = NOW(), updated_at = NOW()
    WHERE id = realtor_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para desbloquear corretor
CREATE OR REPLACE FUNCTION unblock_realtor(realtor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário existe e está bloqueado
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = realtor_id 
        AND blocked_at IS NOT NULL
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Desbloquear usuário
    UPDATE users 
    SET blocked_at = NULL, updated_at = NOW()
    WHERE id = realtor_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Política para permitir bloqueio apenas para admin
CREATE POLICY "Allow block/unblock realtors" ON users FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
        AND blocked_at IS NULL
    )
);

-- Comentário explicativo
COMMENT ON COLUMN users.blocked_at IS 'Timestamp de quando o corretor foi bloqueado. NULL = ativo, NOT NULL = bloqueado';

-- Atualizar consultas de propriedades para considerar corretores bloqueados
-- As propriedades de corretores bloqueados ainda devem aparecer, mas com indicação de bloqueio
-- Isso será tratado no código da aplicação
