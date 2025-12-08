
ALTER TABLE stud_profilis
ADD COLUMN IF NOT EXISTS CV_original_filename VARCHAR(255);


ALTER TABLE imones_profilis
ADD COLUMN IF NOT EXISTS logotipo_original_filename VARCHAR(255);

ALTER TABLE praktikos_skelbimas
ADD COLUMN IF NOT EXISTS tipas VARCHAR(255),
ADD COLUMN IF NOT EXISTS miestas VARCHAR(255),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

ALTER TABLE praktikos_vadovas
ALTER COLUMN CV_failo_kelias DROP NOT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'praktikos_skelbimas_praktikos_vadovo_id_fkey'
        AND table_name = 'praktikos_skelbimas'
    ) THEN
        ALTER TABLE praktikos_skelbimas
        ADD CONSTRAINT praktikos_skelbimas_praktikos_vadovo_id_fkey
        FOREIGN KEY (praktikos_vadovo_id) 
        REFERENCES praktikos_vadovas(vadovo_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_praktikos_tipas ON praktikos_skelbimas (tipas);
CREATE INDEX IF NOT EXISTS idx_praktikos_miestas ON praktikos_skelbimas (miestas);
CREATE INDEX IF NOT EXISTS idx_praktikos_expires_at ON praktikos_skelbimas (expires_at);
CREATE INDEX IF NOT EXISTS idx_paraiska_studento ON praktikos_paraiska (studento_id);
CREATE INDEX IF NOT EXISTS idx_paraiska_praktikos ON praktikos_paraiska (praktikos_id);
CREATE INDEX IF NOT EXISTS idx_paraiska_statusas ON praktikos_paraiska (priemimo_statusas);

