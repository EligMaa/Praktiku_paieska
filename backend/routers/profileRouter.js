
const express = require('express');
const multer = require('multer'); // failams
const path = require('path');
const fs = require('fs');

// const isAuth = require('../middleware/isAuth');

// 
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

const storage = multer.diskStorage({
    // TODO: pakeisti i duomenu bazeje saugoma kelia
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // generuojamas unikalus failo pavadinimas ir saugomas originalus 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Create multer instance with storage configuration
const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        // tikrina failu tipus
        if (file.fieldname === 'CV') {
            // leidzia tik PDF, DOC, DOCX
            const filetypes = /pdf|doc|docx/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error("Only PDF, DOC, and DOCX files are allowed for CV"));
            }
        } else if (file.fieldname === 'logotipo_failo') {
            // leidzai tik jpeg, png, gif, jpg
            const filetypes = /jpeg|jpg|png|gif/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error("Only image files are allowed for logo"));
            }
        } else {
            cb(new Error("Unexpected file field"));
        }
    }
});

const router = express.Router();
const pool = require('../db');


// Handlina failu ikelima profiliuose
const uploadFiles = upload.fields([
    { name: 'CV', maxCount: 1 },
    { name: 'logotipo_failo', maxCount: 1 }
]);

router.post('/api/profile', isAuth, uploadFiles, async (req, res) => {
    try {
        console.log('Profile data received:', req.body);
        console.log('Authenticated user:', req.user);
        
        const userId = req.user.id;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({ 
                error: 'Trūksta privalomo lauko (role)'
            });
        }
        
        // 
        await pool.query(
            "UPDATE vartotojas SET role = $1 WHERE vartotojo_id = $2",
            [role, userId]
        );
        
        // pagal role nurodoma atitinkama informacija
        if (role === 'studentas') {
            const { vardas, pavarde, universitetas, igudziai } = req.body;
            
            if (!vardas || !pavarde || !universitetas || !igudziai) {
                return res.status(400).json({
                    error: 'Trūksta privalomų studentų profilio laukų (vardas, pavarde, universitetas, igudziai)'
                });
            }
            
            // tikrina ar yra tarpu vardas ir pavarde
            if (vardas.includes(' ') || pavarde.includes(' ')) {
                return res.status(400).json({
                    error: 'Vardas ir pavardė negali turėti tarpų'
                });
            }
            
            if (!req.files?.CV) {
                return res.status(400).json({
                    error: 'CV failas yra privalomas'
                });
            }
            
            const CV_failo_kelias = req.files.CV[0].filename;
            const CV_originalname = req.files.CV[0].originalname;
            
            // prideda nauja stulpeli CV originaliam failo pavadinimui, jei neegzistuoja
            try {
                await pool.query(`
                    ALTER TABLE stud_profilis 
                    ADD COLUMN IF NOT EXISTS CV_original_filename VARCHAR(255)
                `);
            } catch (schemaErr) {
                console.error("Error updating schema:", schemaErr);
                
            }
            
            // ierpia informacija i duomenu baze
            await pool.query(
                `INSERT INTO stud_profilis 
                 (studento_id, vardas, pavarde, universitetas, igudziai, CV_failo_kelias, CV_original_filename)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, vardas, pavarde, universitetas, igudziai, CV_failo_kelias, CV_originalname]
            );
        } 
        else if (role === 'imone') {
            const { pavadinimas, aprasymas } = req.body;
            
            if (!pavadinimas || !aprasymas) {
                return res.status(400).json({
                    error: 'Trūksta privalomų įmonės profilio laukų'
                });
            }
            
            // logo failas nera privalomas
            let logotipo_failo_kelias = null;
            let logotipo_originalname = null;
            
            if (req.files?.logotipo_failo) {
                logotipo_failo_kelias = req.files.logotipo_failo[0].filename;
                logotipo_originalname = req.files.logotipo_failo[0].originalname;
            }
            
            // prideda nauja stulpeli logotipo originaliam failo pavadinimui, jei neegzistuoja
            try {
                await pool.query(`
                    ALTER TABLE imones_profilis 
                    ADD COLUMN IF NOT EXISTS logotipo_original_filename VARCHAR(255)
                `);
            } catch (schemaErr) {
                console.error("Error updating schema:", schemaErr);
            }
            
            // iterpia informacija i duomenu baze
            await pool.query(
                `INSERT INTO imones_profilis 
                 (imones_id, pavadinimas, aprasymas, logotipo_failo_kelias, logotipo_original_filename)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, pavadinimas, aprasymas, logotipo_failo_kelias, logotipo_originalname]
            );
        }
        else {
            return res.status(400).json({
                error: 'Neteisinga rolės reikšmė'
            });
        }
        
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error creating profile:", err);
        res.status(500).json({ error: 'Nepavyko išsaugoti profilio: ' + err.message });
    }
});


// Middlewareuztikrinti ar vartotojas autentifikuotas
function isAuth(req, res, next) {
    if (req.user && req.user.id) {
        return next();
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }
}

// API: Ar profilis užpildytas
router.get('/api/has-profile', isAuth, async (req, res) => {
    const userId = req.user.id;
    // Patikrink pagal role
    const userRes = await pool.query(
        "SELECT role FROM vartotojas WHERE vartotojo_id = $1",
        [userId]
    );
    const role = userRes.rows[0]?.role;
    let hasProfile = false;
    if (role === 'studentas') {
        const profRes = await pool.query(
            "SELECT * FROM stud_profilis WHERE studento_id = $1",
            [userId]
        );
        hasProfile = profRes.rows.length > 0;
    } else if (role === 'imone') {
        const profRes = await pool.query(
            "SELECT * FROM imones_profilis WHERE imones_id = $1",
            [userId]
        );
        hasProfile = profRes.rows.length > 0;
    }
    res.json({ hasProfile });
});

router.post('/api/profile-setup', isAuth, async (req, res) => {
    const { role, ...profileData } = req.body;
    const userId = req.user.id;

    try {
        
        await pool.query(
            "UPDATE vartotojas SET role = $1 WHERE vartotojo_id = $2",
            [role, userId]
        );

        // pagal role nurodoma atitinkama informacija
        if (role === "studentas") {
            const { vardas, pavarde, universitetas, igudziai, CV_failo_kelias } = profileData;
            await pool.query(
                `INSERT INTO stud_profilis 
                 (studento_id, vardas, pavarde, universitetas, igudziai, CV_failo_kelias)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, vardas, pavarde, universitetas, igudziai, CV_failo_kelias]
            );
        } else if (role === "imone") {
            const { pavadinimas, aprasymas, logotipo_failo_kelias } = profileData;
            await pool.query(
                `INSERT INTO imones_profilis 
                 (imones_id, pavadinimas, aprasymas, logotipo_failo_kelias)
                 VALUES ($1, $2, $3, $4)`,
                [userId, pavadinimas, aprasymas, logotipo_failo_kelias || null]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Profile setup error:', err);
        res.status(500).json({ error: 'Profile setup failed' });
    }
});

// profilio redagavimoendpoint
router.put('/api/profile/update', isAuth, uploadFiles, async (req, res) => {
    try {
        console.log('Profile update data received:', req.body);
        console.log('Authenticated user:', req.user);
        
        const userId = req.user.id;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({ 
                error: 'Trūksta privalomo lauko (role)'
            });
        }
        
        // pagal role nurodama info kuria galima redaguoti
        if (role === 'studentas') {
            const { vardas, pavarde, universitetas, igudziai } = req.body;
            
            if (!vardas || !pavarde || !universitetas || !igudziai) {
                return res.status(400).json({
                    error: 'Trūksta privalomų studentų profilio laukų'
                });
            }
            
            
            if (vardas.includes(' ') || pavarde.includes(' ')) {
                return res.status(400).json({
                    error: 'Vardas ir pavardė negali turėti tarpų'
                });
            }
            
           
            if (req.files?.CV) {
                const CV_failo_kelias = req.files.CV[0].filename;
                const CV_originalname = req.files.CV[0].originalname;
                
                // atnaujina studento profili su nauju CV
                await pool.query(
                    `UPDATE stud_profilis 
                     SET vardas = $1, pavarde = $2, universitetas = $3, igudziai = $4,
                         CV_failo_kelias = $5, CV_original_filename = $6
                     WHERE studento_id = $7`,
                    [vardas, pavarde, universitetas, igudziai, CV_failo_kelias, CV_originalname, userId]
                );
            } else {
                // anaujina studento profili be CV
                await pool.query(
                    `UPDATE stud_profilis 
                     SET vardas = $1, pavarde = $2, universitetas = $3, igudziai = $4
                     WHERE studento_id = $5`,
                    [vardas, pavarde, universitetas, igudziai, userId]
                );
            }
        } 
        else if (role === 'imone') {
            const { pavadinimas, aprasymas } = req.body;
            
            if (!pavadinimas || !aprasymas) {
                return res.status(400).json({
                    error: 'Trūksta privalomų įmonės profilio laukų'
                });
            }
            
            
            if (req.files?.logotipo_failo) {
                const logotipo_failo_kelias = req.files.logotipo_failo[0].filename;
                const logotipo_originalname = req.files.logotipo_failo[0].originalname;
                
                await pool.query(
                    `UPDATE imones_profilis 
                     SET pavadinimas = $1, aprasymas = $2,
                         logotipo_failo_kelias = $3, logotipo_original_filename = $4
                     WHERE imones_id = $5`,
                    [pavadinimas, aprasymas, logotipo_failo_kelias, logotipo_originalname, userId]
                );
            } else {
                await pool.query(
                    `UPDATE imones_profilis 
                     SET pavadinimas = $1, aprasymas = $2
                     WHERE imones_id = $3`,
                    [pavadinimas, aprasymas, userId]
                );
            }
        }
        else {
            return res.status(400).json({
                error: 'Neteisinga rolės reikšmė'
            });
        }
        
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: 'Nepavyko atnaujinti profilio: ' + err.message });
    }
});

module.exports = router;