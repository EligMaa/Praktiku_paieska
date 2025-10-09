CREATE DATABASE praktika;

CREATE TABLE vartotojas (
    vartotojo_id SERIAL PRIMARY KEY,
    google_id VARCHAR NOT NULL UNIQUE,
    role VARCHAR(20) CHECK (role IN ('studentas', 'imone')) NOT NULL
);

CREATE TABLE stud_profilis (
    studento_id int PRIMARY KEY REFERENCES vartotojas(vartotojo_id) ON DELETE CASCADE,
    vardas VARCHAR(255) NOT NULL,
    pavarde VARCHAR(255) NOT NULL,
    universitetas VARCHAR(225) NOT NULL,
    igudziai VARCHAR(255) NOT NULL,
    CV_failo_kelias VARCHAR(255) NOT NULL
);

CREATE TABLE imones_profilis (
    imones_id int PRIMARY KEY REFERENCES vartotojas(vartotojo_id) ON DELETE CASCADE,
    pavadinimas VARCHAR(255) NOT NULL,
    aprasymas VARCHAR(1000) NOT NULL,
    logotipo_failo_kelias VARCHAR(255)
);

CREATE TABLE praktikos_skelbimas (
    praktikos_id SERIAL PRIMARY KEY,
    imones_id int REFERENCES imones_profilis(imones_id) ON DELETE CASCADE,
    pavadinimas VARCHAR(255) NOT NULL,
    aprasymas VARCHAR(1000) NOT NULL,
    lokacija VARCHAR(255) NOT NULL,
    reikalavimai VARCHAR(1000) NOT NULL,
    praktikos_vadovo_id INT
);

CREATE TABLE praktikos_paraiska (
    paraiskos_id SERIAL PRIMARY KEY,
    studento_id int REFERENCES stud_profilis(studento_id) ON DELETE CASCADE,
    praktikos_id int REFERENCES praktikos_skelbimas(praktikos_id) ON DELETE CASCADE,
    pateikimo_laikas TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priemimo_statusas VARCHAR(20) CHECK (priemimo_statusas IN ('laukia', 'patvirtinta', 'atmesta')) NOT NULL DEFAULT 'laukia'
);

CREATE TABLE praktikos_vadovas (
    vadovo_id SERIAL PRIMARY KEY,
    vardas VARCHAR(255) NOT NULL,
    pavarde VARCHAR(255) NOT NULL,
    CV_failo_kelias VARCHAR(255) NOT NULL,
    el_pastas VARCHAR(255) NOT NULL UNIQUE,
    telefonas VARCHAR(20)
);