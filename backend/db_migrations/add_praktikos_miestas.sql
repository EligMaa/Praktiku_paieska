-- Add 'miestas' column to praktikos_skelbimas table
ALTER TABLE praktikos_skelbimas
ADD COLUMN IF NOT EXISTS miestas VARCHAR(255);

-- Optional: index on miestas to speed up city filtered queries
CREATE INDEX IF NOT EXISTS idx_praktikos_miestas ON praktikos_skelbimas (miestas);
