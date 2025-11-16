-- Migration: add el_pastas column to vartotojas table

ALTER TABLE vartotojas ADD COLUMN IF NOT EXISTS el_pastas VARCHAR(255);
