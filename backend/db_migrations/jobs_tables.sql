-- Migration: create tables for internships and mentors

CREATE TABLE IF NOT EXISTS praktikos_vadovas (
    vadovo_id SERIAL PRIMARY KEY,
    vardas VARCHAR(255) NOT NULL,
    pavarde VARCHAR(255) NOT NULL,
    CV_failo_kelias VARCHAR(255),
    el_pastas VARCHAR(255) NOT NULL UNIQUE,
    telefonas VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS praktikos_skelbimas (
    praktikos_id SERIAL PRIMARY KEY,
    imones_id int REFERENCES imones_profilis(imones_id) ON DELETE CASCADE,
    pavadinimas VARCHAR(255) NOT NULL,
    aprasymas VARCHAR(1000) NOT NULL,
    lokacija VARCHAR(255) NOT NULL,
    reikalavimai VARCHAR(1000),
    praktikos_vadovo_id INT REFERENCES praktikos_vadovas(vadovo_id)
);

CREATE TABLE IF NOT EXISTS praktikos_paraiska (
    paraiskos_id SERIAL PRIMARY KEY,
    studento_id int REFERENCES stud_profilis(studento_id) ON DELETE CASCADE,
    praktikos_id int REFERENCES praktikos_skelbimas(praktikos_id) ON DELETE CASCADE,
    pateikimo_laikas TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priemimo_statusas VARCHAR(20) CHECK (priemimo_statusas IN ('laukia', 'patvirtinta', 'atmesta')) NOT NULL DEFAULT 'laukia'
);
