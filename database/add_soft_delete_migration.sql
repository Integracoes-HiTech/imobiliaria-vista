-- Migração para adicionar soft delete na tabela properties
-- Execute este script no Supabase SQL Editor

-- Adicionar campo deleted_at na tabela properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Criar índice para melhor performance nas consultas de soft delete
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at);

-- Atualizar políticas RLS para considerar soft delete
-- Remover política antiga
DROP POLICY IF EXISTS "Everyone can read properties" ON properties;

-- Criar nova política que exclui registros deletados logicamente
CREATE POLICY "Everyone can read active properties" ON properties FOR SELECT USING (
    deleted_at IS NULL
);

-- Manter política de modificação existente (já considera soft delete)
-- CREATE POLICY "Realtors can modify their own properties" ON properties FOR ALL USING (
--     realtor_id = auth.uid() OR
--     EXISTS (
--         SELECT 1 FROM users 
--         WHERE id = auth.uid() 
--         AND type = 'admin' 
--         AND is_active = true
--     )
-- );

-- Função para soft delete de propriedades
CREATE OR REPLACE FUNCTION soft_delete_property(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se a propriedade existe e não está deletada
    IF NOT EXISTS (
        SELECT 1 FROM properties 
        WHERE id = property_id 
        AND deleted_at IS NULL
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Marcar como deletada
    UPDATE properties 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = property_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para restaurar propriedade deletada
CREATE OR REPLACE FUNCTION restore_property(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se a propriedade existe e está deletada
    IF NOT EXISTS (
        SELECT 1 FROM properties 
        WHERE id = property_id 
        AND deleted_at IS NOT NULL
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Restaurar propriedade
    UPDATE properties 
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = property_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Política para permitir soft delete apenas para admin e dono da propriedade
CREATE POLICY "Allow soft delete properties" ON properties FOR UPDATE USING (
    (realtor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND type = 'admin' 
        AND is_active = true
    ))
    AND deleted_at IS NULL
);

-- Comentário explicativo
COMMENT ON COLUMN properties.deleted_at IS 'Timestamp de quando a propriedade foi deletada logicamente. NULL = ativa, NOT NULL = deletada';
