const express = require('express');
const router = express.Router();
const passport = require('passport');

// Mode (signup/login) is passed as a query param
router.get(
    "/auth/google", 
    (req, res, next) => {
        req.session.authMode = req.query.mode || "login";
        next();
    },
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

router.get(
    "/google/callback", 
    passport.authenticate("google", {session: true}),
    (req, res) => {
        // Depending on mode, redirect appropriately
        const mode = req.session.authMode;
        if (mode === "signup" && req.user && req.user.isNewUser) {
            // Redirect to profile setup
            res.redirect(`${process.env.CLIENT_URL}/profile-setup`);
        } else if (mode === "login" && req.user) {
            // Redirect to dashboard
            res.redirect(`${process.env.CLIENT_URL}/dashboard`);
        } else {
            // Default
            res.redirect(`${process.env.CLIENT_URL}/`);
        }
    }
);

module.exports = router;