-- TODO: Adicionar queries SQL úteis

-- Adicionar campo has_used_trial
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_used_trial boolean DEFAULT false;

-- TODO: Adicionar mais queries
