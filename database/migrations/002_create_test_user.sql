-- Migration: Create test user for development
-- Description: Creates a test user profile for local development
-- Date: 2025-01-17

-- ATENÇÃO: Execute apenas em ambiente de DESENVOLVIMENTO!
-- NÃO execute em produção

-- Criar usuário de teste
INSERT INTO public.profiles (id, full_name, email, trial_used, whatsapp)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Usuário de Teste',
  'teste@exemplo.com',
  false,
  '11999999999'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  trial_used = EXCLUDED.trial_used,
  whatsapp = EXCLUDED.whatsapp,
  updated_at = now();

-- Verificar se foi criado
SELECT id, full_name, email, trial_used, created_at
FROM public.profiles
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
