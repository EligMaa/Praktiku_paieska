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

// GET /api/praktikos[?imones_id=]
router.get('/api/praktikos', async (req, res) => {
  try {
    const { imones_id } = req.query;
    let q = `SELECT p.*, ip.pavadinimas AS imones_pavadinimas, v.vardas AS vadovas_vardas, v.pavarde AS vadovas_pavarde, v.el_pastas AS vadovas_email
             FROM praktikos_skelbimas p
             LEFT JOIN imones_profilis ip ON p.imones_id = ip.imones_id
             LEFT JOIN praktikos_vadovas v ON p.praktikos_vadovo_id = v.vadovo_id`;
    const params = [];
    if (imones_id) {
      q += ' WHERE p.imones_id = $1';
      params.push(imones_id);
    }
    q += ' ORDER BY p.praktikos_id DESC';
    const result = await pool.query(q, params);
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
      `SELECT p.*, ip.pavadinimas AS imones_pavadinimas, v.*
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

    
  const { pavadinimas, aprasymas, lokacija, tipas, reikalavimai, vadovas_vardas, vadovas_pavarde, vadovas_el_pastas, vadovas_telefonas } = req.body;


    // Basic validation
    if (!pavadinimas || !aprasymas || !lokacija) {
      return res.status(400).json({ error: 'Missing required internship fields (pavadinimas, aprasymas, lokacija)' });
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

    // Check if vadovas exists by email
    let vadovasId = null;
    const existing = await pool.query('SELECT vadovo_id FROM praktikos_vadovas WHERE el_pastas = $1', [vadovas_el_pastas]);
    if (existing.rows.length > 0) {
      vadovasId = existing.rows[0].vadovo_id;
      // Optionally update CV path if new file uploaded
      if (vadovas_cv_path) {
        await pool.query('UPDATE praktikos_vadovas SET CV_failo_kelias = $1, telefonas = $2 WHERE vadovo_id = $3', [vadovas_cv_path, vadovas_telefonas || null, vadovasId]);
      }
    } else {
      const ins = await pool.query(
        `INSERT INTO praktikos_vadovas (vardas, pavarde, CV_failo_kelias, el_pastas, telefonas)
         VALUES ($1, $2, $3, $4, $5) RETURNING vadovo_id`,
        [vadovas_vardas, vadovas_pavarde, vadovas_cv_path, vadovas_el_pastas, vadovas_telefonas || null]
      );
      vadovasId = ins.rows[0].vadovo_id;
    }

    // Insert internship (include optional 'tipas' if provided)
    const ins2 = await pool.query(
      `INSERT INTO praktikos_skelbimas (imones_id, pavadinimas, aprasymas, lokacija, tipas, reikalavimai, praktikos_vadovo_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING praktikos_id`,
      [userId, pavadinimas, aprasymas, lokacija, tipas || null, reikalavimai || '', vadovasId]
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

module.exports = router;
