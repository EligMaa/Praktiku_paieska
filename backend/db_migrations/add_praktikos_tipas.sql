-- Migration: add 'tipas' column to praktikos_skelbimas

ALTER TABLE praktikos_skelbimas
ADD COLUMN IF NOT EXISTS tipas VARCHAR(255);
