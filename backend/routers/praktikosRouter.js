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

// GET /api/praktikos[?imones_id=&q=&tipas=&miestas=]
router.get('/api/praktikos', async (req, res) => {
  try {
    const { imones_id, q: searchQuery, tipas, miestas } = req.query;
  let base = `SELECT p.*, ip.pavadinimas AS imones_pavadinimas, ip.logotipo_failo_kelias AS imones_logotipas, 
                 v.vardas AS vadovas_vardas, v.pavarde AS vadovas_pavarde, v.el_pastas AS vadovas_email, v.telefonas AS vadovas_telefonas, v.CV_failo_kelias AS vadovas_cv_failo,
                 (SELECT COUNT(*) FROM praktikos_paraiska pp WHERE pp.praktikos_id = p.praktikos_id) AS application_count
       FROM praktikos_skelbimas p
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

    if (searchQuery) {
      // iesko pavadinime, aprasyme, imones pavadinime, miestame, lokacijaje ir vadovo info
      whereClauses.push(`(
        p.pavadinimas ILIKE $${idx} OR
        p.aprasymas ILIKE $${idx} OR
        ip.pavadinimas ILIKE $${idx} OR
        p.miestas ILIKE $${idx} OR
        p.lokacija ILIKE $${idx} OR
        v.vardas ILIKE $${idx} OR
        v.pavarde ILIKE $${idx} OR
        v.el_pastas ILIKE $${idx}
      )`);
      params.push(`%${searchQuery}%`);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';
    const finalSql = base + whereSql + ' ORDER BY p.praktikos_id DESC';
    const result = await pool.query(finalSql, params);
    res.json(result.rows);
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


    // Basic validation
    if (!pavadinimas || !aprasymas || !lokacija || !miestas) {
      return res.status(400).json({ error: 'Missing required internship fields (pavadinimas, aprasymas, lokacija, miestas)' });
    }

    if (!tipas) {
      return res.status(400).json({ error: 'Pasirinkite praktikos sritį / tipą' });
    }

    // normalize and validate tipas against allowed list
    const tipasNormalized = String(tipas).trim();
    if (!INTERN_TYPES.includes(tipasNormalized)) {
      return res.status(400).json({ error: 'Neteisingas praktikos tipas' });
    }

    if (!vadovas_vardas || !vadovas_pavarde || !vadovas_el_pastas) {
      return res.status(400).json({ error: 'Missing required vadovas fields (vardas, pavarde, el_pastas)'});
    }

    // Email validacija
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(vadovas_el_pastas)) return res.status(400).json({ error: 'Invalid vadovas email' });

   
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
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/praktikos/:id/apply - studentai aplikuoja i praktika
router.post('/api/praktikos/:id/apply', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // check role
    const userRes = await pool.query('SELECT role FROM vartotojas WHERE vartotojo_id = $1', [userId]);
    const role = userRes.rows[0]?.role;
    if (role !== 'studentas') return res.status(403).json({ error: 'Only students can apply to internships' });

    const praktikosId = parseInt(req.params.id, 10);
    if (Number.isNaN(praktikosId)) return res.status(400).json({ error: 'Invalid internship id' });

    // verify internship exists
    const pRes = await pool.query('SELECT praktikos_id FROM praktikos_skelbimas WHERE praktikos_id = $1', [praktikosId]);
    if (pRes.rows.length === 0) return res.status(404).json({ error: 'Internship not found' });

  // ensure student profile exists
  const studRes = await pool.query('SELECT studento_id FROM stud_profilis WHERE studento_id = $1', [userId]);
  if (studRes.rows.length === 0) return res.status(400).json({ error: 'Student profile not found. Please complete your student profile before applying.' });

  // prevent duplicate application
    const dup = await pool.query('SELECT paraiskos_id FROM praktikos_paraiska WHERE studento_id = $1 AND praktikos_id = $2', [userId, praktikosId]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ error: 'You have already applied to this internship' });
    }

    // insert application
    const ins = await pool.query(
      'INSERT INTO praktikos_paraiska (studento_id, praktikos_id) VALUES ($1, $2) RETURNING paraiskos_id',
      [userId, praktikosId]
    );

    // return updated application count
    const cntRes = await pool.query('SELECT COUNT(*)::int AS count FROM praktikos_paraiska WHERE praktikos_id = $1', [praktikosId]);
    const application_count = cntRes.rows[0].count;

    res.status(201).json({ paraiskos_id: ins.rows[0].paraiskos_id, application_count });
  } catch (err) {
    console.error('Error applying to internship:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

