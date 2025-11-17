-- Migration: Add trial_used field to profiles table
-- Description: Tracks if user has already used their 7-day trial period
-- Date: 2025-01-16

-- Add trial_used column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN NOT NULL DEFAULT false;

-- Add comment to the column
COMMENT ON COLUMN public.profiles.trial_used IS 'Indicates if the user has already used their 7-day trial period for any workspace';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_used ON public.profiles(trial_used);
