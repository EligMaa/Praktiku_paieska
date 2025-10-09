const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to ensure user is authenticated
function isAuth(req, res, next) {
    if (req.user && req.user.id) return next();
    return res.status(401).json({ error: 'Not authenticated' });
}

router.post('/api/profile-setup', isAuth, async (req, res) => {
    const { role, ...profileData } = req.body;
    const userId = req.user.id;

    try {
        // 1. Update role in vartotojas table
        await pool.query(
            "UPDATE vartotojas SET role = $1 WHERE vartotojo_id = $2",
            [role, userId]
        );

        // 2. Insert profile info depending on role
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

module.exports = router;