-- Add 'expires_at' column to praktikos_skelbimas table
ALTER TABLE praktikos_skelbimas
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Optional index on expires_at for queries
CREATE INDEX IF NOT EXISTS idx_praktikos_expires_at ON praktikos_skelbimas (expires_at);
