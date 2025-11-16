const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const pool = require('../db');
const isAuth = require('../isAuth');
const INTERN_TYPES = require('../data/internshipTypes');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const MAX_VADOVAS_CV = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_VADOVAS_CV },
  fileFilter: (req, file, cb) => {
    
    const allowed = /pdf|doc|docx/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    if (extOk) return cb(null, true);
    cb(new Error('CV turi būti PDF, DOC or DOCX'));
  }
});

// Multer error handler for this router: convert upload errors to 400 with message
router.use((err, req, res, next) => {
  // Multer's errors are instances of MulterError, but fileFilter uses Error; handle both
  if (err && (err.name === 'MulterError' || String(err.message).toLowerCase().includes('cv') || String(err.message).toLowerCase().includes('file'))) {
    console.warn('Upload error:', err.message || err);
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  return next(err);
});


// grazina praktiku sarasa pagal filtrus
// GET /api/praktikos[?imones_id=&q=&tipas=&miestas=]
router.get('/api/praktikos', async (req, res) => {
  try {
    const { imones_id, q: searchQuery, tipas, miestas } = req.query;
    // PUSLAPIAVIMAS
    let page = parseInt(req.query.page, 10) || 1;
    let per_page = parseInt(req.query.per_page, 10) || 10; // numatyta 10 įrašu per puslapi
    if (page < 1) page = 1;

    // be viršutinio limito klientas galėtų siųsti per_page=100000 
    // ir priversti DB grąžinti daug eilučių, sunaudoti daug atminties ir išjungti serverį
    const MAX_PER_PAGE = 100;
    if (per_page < 1) per_page = 10;
    if (per_page > MAX_PER_PAGE) per_page = MAX_PER_PAGE;

    const selectCols = `p.*, ip.pavadinimas AS imones_pavadinimas, ip.logotipo_failo_kelias AS imones_logotipas,
                 v.vardas AS vadovas_vardas, v.pavarde AS vadovas_pavarde, v.el_pastas AS vadovas_email, v.telefonas AS vadovas_telefonas, v.CV_failo_kelias AS vadovas_cv_failo,
                 (SELECT COUNT(*) FROM praktikos_paraiska pp WHERE pp.praktikos_id = p.praktikos_id) AS application_count`;

    const fromSql = `FROM praktikos_skelbimas p
       LEFT JOIN imones_profilis ip ON p.imones_id = ip.imones_id
       LEFT JOIN praktikos_vadovas v ON p.praktikos_vadovo_id = v.vadovo_id`;

    const whereClauses = [];
    const params = [];
    let idx = 1;

    if (imones_id) {
      whereClauses.push(`p.imones_id = $${idx++}`);
      params.push(imones_id);
    }

    if (tipas) {
      whereClauses.push(`p.tipas = $${idx++}`);
      params.push(tipas);
    }

    if (miestas) {
      whereClauses.push(`p.miestas = $${idx++}`);
      params.push(miestas);
    }

    // jei ieskoma pagal uzklausa
    if (searchQuery) {
      // padalina vartotojo uzklausa i atskirus zodzius
  
      const raw = String(searchQuery || '').trim();
      const mode = req.query.searchMode === 'any' ? 'any' : 'all';
      // split on whitespace, remove empty tokens, limit to avoid too large queries
      let words = raw.split(/\s+/).map(w => w.trim()).filter(Boolean);
      const MAX_WORDS = 10;
      if (words.length > MAX_WORDS) words = words.slice(0, MAX_WORDS);

      if (words.length > 0) {

        const wordClauses = [];
        for (const word of words) {
          const paramIndex = idx;
          // push the parameter for this word (used by all columns in this subclause)
          params.push(`%${word}%`);
          idx++;
          // build the OR block for this word
          wordClauses.push(`(
            p.pavadinimas ILIKE $${paramIndex} OR
            p.aprasymas ILIKE $${paramIndex} OR
            p.tipas ILIKE $${paramIndex} OR
            p.aprasymas ILIKE $${paramIndex} OR
            ip.pavadinimas ILIKE $${paramIndex} OR
            p.miestas ILIKE $${paramIndex} OR
            p.lokacija ILIKE $${paramIndex} OR
            v.vardas ILIKE $${paramIndex} OR
            v.pavarde ILIKE $${paramIndex} OR
            v.el_pastas ILIKE $${paramIndex}
          )`);
        }

        const joiner = mode === 'any' ? ' OR ' : ' AND ';
        whereClauses.push('(' + wordClauses.join(joiner) + ')');
      }
    }

    const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

    // isgauti bendrą įrašų skaiciu
    const countSql = `SELECT COUNT(*)::int as total ${fromSql} ${whereSql}`;
    const countRes = await pool.query(countSql, params);
    const total = countRes.rows[0] ? parseInt(countRes.rows[0].total, 10) : 0;

    // PUSLAPIAVIMAS
    const offset = (page - 1) * per_page;
    params.push(per_page);
    params.push(offset);

    const finalSql = `SELECT ${selectCols} ${fromSql} ${whereSql} ORDER BY p.praktikos_id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const result = await pool.query(finalSql, params);
    
    // PUSLAPIAVIMUI
    const total_pages = Math.ceil(total / per_page);

    res.json({ items: result.rows, total, page, per_page, total_pages });
  } catch (err) {
    console.error('Error fetching internships:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single
router.get('/api/praktikos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `SELECT p.*, ip.pavadinimas AS imones_pavadinimas, ip.logotipo_failo_kelias AS imones_logotipas,
         v.vardas AS vadovas_vardas, v.pavarde AS vadovas_pavarde, v.el_pastas AS vadovas_email, v.telefonas AS vadovas_telefonas, v.CV_failo_kelias AS vadovas_cv_failo,
         (SELECT COUNT(*) FROM praktikos_paraiska pp WHERE pp.praktikos_id = p.praktikos_id) AS application_count
       FROM praktikos_skelbimas p
       LEFT JOIN imones_profilis ip ON p.imones_id = ip.imones_id
       LEFT JOIN praktikos_vadovas v ON p.praktikos_vadovo_id = v.vadovo_id
       WHERE p.praktikos_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching internship:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// paktikos kurimas tik imonems
router.post('/api/praktikos', isAuth, upload.single('vadovas_CV'), async (req, res) => {
  try {
    // tikrina ar useris imone
    const userId = req.user.id;
    const userRes = await pool.query('SELECT role FROM vartotojas WHERE vartotojo_id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'imone') return res.status(403).json({ error: 'Only companies can create internships' });

    
  // Debug: log incoming body and file (temporary)
  console.log('Create internship request body:', req.body);
  console.log('Create internship uploaded file:', req.file && req.file.filename);

  const { pavadinimas, aprasymas, lokacija, miestas, expires_at, tipas, reikalavimai, vadovas_vardas, vadovas_pavarde, vadovas_el_pastas, vadovas_telefonas } = req.body;

    // Server-side validation (mirror client rules)
    const fieldErrors = {};
    const pushFieldError = (k, m) => { fieldErrors[k] = m; };

    // required fields
    if (!pavadinimas || !String(pavadinimas).trim()) pushFieldError('pavadinimas', 'Pavadinimas yra privalomas');
    if (!aprasymas || !String(aprasymas).trim()) pushFieldError('aprasymas', 'Aprašymas yra privalomas');
    if (!lokacija || !String(lokacija).trim()) pushFieldError('lokacija', 'Adresas yra privalomas');
    if (!miestas || !String(miestas).trim()) pushFieldError('miestas', 'Pasirinkite miestą');
    if (!reikalavimai || !String(reikalavimai).trim()) pushFieldError('reikalavimai', 'Reikalavimai yra privalomi');
    if (!tipas || !String(tipas).trim()) pushFieldError('tipas', 'Pasirinkite praktikos sritį / tipą');

    // length limits
    if (pavadinimas && String(pavadinimas).trim().length > 50) pushFieldError('pavadinimas', 'Pavadinimas negali viršyti 50 simbolių');
    if (aprasymas && String(aprasymas).trim().length > 1000) pushFieldError('aprasymas', 'Aprašymas negali viršyti 1000 simbolių');
    if (reikalavimai && String(reikalavimai).trim().length > 1000) pushFieldError('reikalavimai', 'Reikalavimai negali viršyti 1000 simbolių');
    if (lokacija && String(lokacija).trim().length > 50) pushFieldError('lokacija', 'Adresas negali viršyti 50 simbolių');

    // address must contain at least one digit
    if (lokacija && !/\d/.test(String(lokacija))) pushFieldError('lokacija', 'Adresas turi turėti namo numerį');

    // vadovas fields required and length
  if (!vadovas_vardas || !String(vadovas_vardas).trim()) pushFieldError('praktikos_vadovas_vardas', 'Vadovo vardas yra privalomas');
  if (!vadovas_pavarde || !String(vadovas_pavarde).trim()) pushFieldError('praktikos_vadovas_pavarde', 'Vadovo pavardė yra privaloma');
  if (!vadovas_el_pastas || !String(vadovas_el_pastas).trim()) pushFieldError('praktikos_vadovas_el_pastas', 'Vadovo el. paštas yra privalomas');
  if (!vadovas_telefonas || !String(vadovas_telefonas).trim()) pushFieldError('praktikos_vadovas_tel', 'Vadovo telefono numeris yra privalomas');

  if (vadovas_vardas && String(vadovas_vardas).trim().length > 50) pushFieldError('praktikos_vadovas_vardas', 'Vardas negali viršyti 50 simbolių');
  if (vadovas_pavarde && String(vadovas_pavarde).trim().length > 50) pushFieldError('praktikos_vadovas_pavarde', 'Pavardė negali viršyti 50 simbolių');
  if (vadovas_el_pastas && String(vadovas_el_pastas).trim().length > 50) pushFieldError('praktikos_vadovas_el_pastas', 'El. paštas negali viršyti 50 simbolių');

    // email
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (vadovas_el_pastas && !emailRe.test(String(vadovas_el_pastas).trim())) pushFieldError('praktikos_vadovas_el_pastas', 'Neteisingas vadovo el. pašto adresas');

    // phone strict format
    const phoneStrictRe = /^\+370\d{8}$/;
  if (vadovas_telefonas && !phoneStrictRe.test(String(vadovas_telefonas).trim())) pushFieldError('praktikos_vadovas_tel', 'Telefono numeris turi prasidėti +370 ir būti 12 simbolių, pvz. +37069696996');

    // tipas must be one of allowed
    const tipasNormalized = String(tipas || '').trim();
    if (tipas && !INTERN_TYPES.includes(tipasNormalized)) pushFieldError('tipas', 'Neteisingas praktikos tipas');

    // expires_at validation
    if (expires_at) {
      const dt = new Date(expires_at);
      if (isNaN(dt.getTime())) pushFieldError('expires_at', 'Invalid expires_at date');
      else {
        const now = new Date();
        if (dt <= now) pushFieldError('expires_at', 'Pasirinkite galiojančią ateities datą pasibaigimui');
        if (dt.getFullYear() > 2100) pushFieldError('expires_at', 'Pasirinkite datą ne vėlesnę nei 2100-12-31');
      }
    }

    // file must be present (multer already checks size/type)
    if (!req.file) pushFieldError('vadovas_CV', 'Pridėkite vadovo CV (PDF/DOC/DOCX)');

    // validate city against known list if available
    try {
      // try to load frontend city list to ensure canonical values
      const cityList = require('../..//frontend/src/data/cityList');
      const cities = cityList && cityList.CITY_LIST ? cityList.CITY_LIST : cityList;
      if (miestas && Array.isArray(cities) && cities.length > 0 && !cities.includes(miestas)) {
        pushFieldError('miestas', 'Neteisingas miestas');
      }
    } catch (e) {
      // ignore if cannot load; not critical
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ error: 'Patikrinkite formos laukus', fieldErrors });
    }

   
    let vadovas_cv_path = null;
    if (req.file) vadovas_cv_path = req.file.filename;

    // Normalize phone and enforce format: must start with +370 and be exactly 12 characters (e.g. +37069696996)
    let phoneTrimmed = null;
    if (vadovas_telefonas) {
      phoneTrimmed = String(vadovas_telefonas).trim();
      const phoneStrictRe = /^\+370\d{8}$/;
      if (!phoneStrictRe.test(phoneTrimmed)) {
        return res.status(400).json({ error: 'Vadovo telefono numeris turi prasidėti +370 ir būti 12 simbolių, pvz. +37069696996' });
      }
    }

    // expires_at validation: if present must be a valid future date and not after year 2100
    if (expires_at) {
      const dt = new Date(expires_at);
      if (isNaN(dt.getTime())) {
        return res.status(400).json({ error: 'Invalid expires_at date' });
      }
      const now = new Date();
      if (dt <= now) {
        return res.status(400).json({ error: 'Pasirinkite galiojančią ateities datą pasibaigimui' });
      }
      if (dt.getFullYear() > 2100) {
        return res.status(400).json({ error: 'Pasirinkite datą ne vėlesnę nei 2100-12-31' });
      }
    }

    // Check if vadovas exists by email
    let vadovasId = null;
    const existing = await pool.query('SELECT vadovo_id FROM praktikos_vadovas WHERE el_pastas = $1', [vadovas_el_pastas]);
    if (existing.rows.length > 0) {
      vadovasId = existing.rows[0].vadovo_id;
      // Optionally update CV path if new file uploaded
      if (vadovas_cv_path) {
        await pool.query('UPDATE praktikos_vadovas SET CV_failo_kelias = $1, telefonas = $2 WHERE vadovo_id = $3', [vadovas_cv_path, phoneTrimmed || null, vadovasId]);
      }
    } else {
      const ins = await pool.query(
        `INSERT INTO praktikos_vadovas (vardas, pavarde, CV_failo_kelias, el_pastas, telefonas)
         VALUES ($1, $2, $3, $4, $5) RETURNING vadovo_id`,
        [vadovas_vardas, vadovas_pavarde, vadovas_cv_path, vadovas_el_pastas, phoneTrimmed || null]
      );
      vadovasId = ins.rows[0].vadovo_id;
    }

    // Insert internship (include optional 'tipas' and optional 'expires_at' and save city (miestas)
    console.log('Inserting internship with values:', {
      imones_id: userId,
      pavadinimas,
      aprasymas,
      lokacija,
      miestas,
      expires_at,
      tipas,
      reikalavimai,
      praktikos_vadovo_id: vadovasId
    });

    const ins2 = await pool.query(
      `INSERT INTO praktikos_skelbimas (imones_id, pavadinimas, aprasymas, lokacija, miestas, expires_at, tipas, reikalavimai, praktikos_vadovo_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING praktikos_id`,
      [userId, pavadinimas, aprasymas, lokacija, miestas || null, expires_at || null, tipas || null, reikalavimai || '', vadovasId]
    );

    const createdId = ins2.rows[0].praktikos_id;
    const created = await pool.query(
      `SELECT p.*, ip.pavadinimas AS imones_pavadinimas, v.vardas AS vadovas_vardas, v.pavarde AS vadovas_pavarde, v.el_pastas AS vadovas_email
       FROM praktikos_skelbimas p
       LEFT JOIN imones_profilis ip ON p.imones_id = ip.imones_id
       LEFT JOIN praktikos_vadovas v ON p.praktikos_vadovo_id = v.vadovo_id
       WHERE p.praktikos_id = $1`,
      [createdId]
    );

    res.status(201).json(created.rows[0]);
  } catch (err) {
    console.error('Error creating internship:', err);
    // Return the error message in dev to help debugging (safe in local/dev)
    const msg = err && err.message ? err.message : 'Server error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/praktikos/:id/apply - studentai aplikuoja i praktika
router.post('/api/praktikos/:id/apply', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // tkrina role
    const userRes = await pool.query('SELECT role FROM vartotojas WHERE vartotojo_id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'studentas') return res.status(403).json({ error: 'Tik studentai gali aplikuoti i praktika' });

    const praktikosId = parseInt(req.params.id, 10);
    if (Number.isNaN(praktikosId)) return res.status(400).json({ error: 'Invalid internship id' });

    // tikrina ar praktikos skelbimas egzistuoja
    const pRes = await pool.query('SELECT praktikos_id FROM praktikos_skelbimas WHERE praktikos_id = $1', [praktikosId]);
    if (pRes.rows.length === 0) return res.status(404).json({ error: 'Internship not found' });

    // uzkrauna studento profilio info
    const studRes = await pool.query(
      `SELECT studento_id, vardas, pavarde, universitetas, igudziai, CV_failo_kelias as cv_failo_kelias
       FROM stud_profilis WHERE studento_id = $1`,
      [userId]
    );
    if (studRes.rows.length === 0) return res.status(400).json({ error: 'Student profile not found. Please complete your student profile before applying.' });

    const studProfile = studRes.rows[0];

    // assemble a final profile object combining session info and stud_profilis for clearer logs
    const finalProfile = Object.assign(
      {
        id: userId,
        isNewUser: false,
      },
      req.user || {},
      {
        role: role,
        studento_id: studProfile.studento_id,
        vardas: studProfile.vardas,
        pavarde: studProfile.pavarde,
        universitetas: studProfile.universitetas,
        igudziai: studProfile.igudziai,
        cv_failo_kelias: studProfile.cv_failo_kelias || null,
        cv_original_filename: studProfile.cv_original_filename || null
      }
    );

    // Log duomenis konsolei
    console.log('Final profile data being sent:', finalProfile);
    console.log('Student profile data found:', studProfile);

    // neleidzia pakartotinio aplikavimo
    const dup = await pool.query('SELECT paraiskos_id FROM praktikos_paraiska WHERE studento_id = $1 AND praktikos_id = $2', [userId, praktikosId]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ error: 'Jus negalite dar karta aplikuoti i ta pacia praktika' });
    }

    // insert application
    const ins = await pool.query(
      'INSERT INTO praktikos_paraiska (studento_id, praktikos_id) VALUES ($1, $2) RETURNING paraiskos_id',
      [userId, praktikosId]
    );

    // return updated application count
    const cntRes = await pool.query('SELECT COUNT(*)::int AS count FROM praktikos_paraiska WHERE praktikos_id = $1', [praktikosId]);
    const application_count = cntRes.rows[0].count;

    // Log aplikacijos event
    console.log(`Student ${userId} applied to internship ${praktikosId} -> paraiskos_id=${ins.rows[0].paraiskos_id}; total_applications=${application_count}`);
    // sukurta aplikacija
    console.log('Application created:', {
      paraiskos_id: ins.rows[0].paraiskos_id,
      praktikos_id: praktikosId,
      studento_id: userId,
      application_count
    });

    res.status(201).json({ paraiskos_id: ins.rows[0].paraiskos_id, application_count });
  } catch (err) {
    console.error('Error applying to internship:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/praktikos/:id/application-status - get studento aplikacijos statusa konkrečiai praktikai
router.get('/api/praktikos/:id/application-status', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const praktikosId = parseInt(req.params.id, 10);
    
    // tikrina ar useris studentas
    const userRes = await pool.query('SELECT role FROM vartotojas WHERE vartotojo_id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    
    if (role !== 'studentas') {
      return res.status(403).json({ error: 'Only students can check application status' });
    }
    
    // ieško aplikacijos
    const result = await pool.query(
      'SELECT paraiskos_id, priemimo_statusas FROM praktikos_paraiska WHERE studento_id = $1 AND praktikos_id = $2',
      [userId, praktikosId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // grąžina aplikacijos statusą ( arba default 'laukia' )
    res.json({ 
      paraiskos_id: result.rows[0].paraiskos_id,
      status: result.rows[0].priemimo_statusas || 'laukia' 
    });
  } catch (err) {
    console.error('Error fetching application status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/my-applications - get studento aplikacijas i praktika
router.get('/api/my-applications', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // tikrina ar useris studentas
    const userRes = await pool.query('SELECT role FROM vartotojas WHERE vartotojo_id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    
    if (role !== 'studentas') {
      return res.status(403).json({ error: 'Only students can view applications' });
    }
    
    // gauna studento aplikacijas su praktuku informacija
    const result = await pool.query(
      `SELECT 
        pp.paraiskos_id as application_id,
        pp.praktikos_id,
        pp.pateikimo_laikas,
        pp.priemimo_statusas as status,
        p.pavadinimas as job_title,
        p.tipas as type,
        p.lokacija as location,
        p.miestas,
        ip.pavadinimas as company_name
       FROM praktikos_paraiska pp
       LEFT JOIN praktikos_skelbimas p ON pp.praktikos_id = p.praktikos_id
       LEFT JOIN imones_profilis ip ON p.imones_id = ip.imones_id
       WHERE pp.studento_id = $1
       ORDER BY pp.pateikimo_laikas DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});






module.exports = router;

