const express = require('express');
const router = express.Router();
const isAuth = require('../isAuth');

router.get("/account",isAuth, (req, res) => {
    const vartotojas = {
        ...req.vartotojas,
        loggedIn: true,
    };
    res.json(vartotojas);
});

module.exports = router;