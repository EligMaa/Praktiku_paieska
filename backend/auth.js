const passport = require('passport');
const {Strategy: GoogleStrategy} = require('passport-google-oauth20');
require("dotenv").config();
const pool = require('./db');

passport.use(
    
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (_, __, profile, done) => {
            const account = profile._json;
            let vartotojas = {};
            try {
                const currentVartotojaQuery = await pool.query(
                    "SELECT * FROM vartotojas WHERE google_id = $1", 
                    [account.sub]
                );

                // Use session to get mode (signup or login)
                const mode = _.session?.authMode || 'login';

                if (mode === 'signup') {
                    if (currentVartotojaQuery.rows.length === 0) {
                        const role = null; // Will be chosen in profile setup
                        await pool.query(
                            "INSERT INTO vartotojas (google_id, role) VALUES ($1, $2)", 
                            [account.sub, role]
                        );
                        const idQuery = await pool.query(
                            "SELECT vartotojo_id FROM vartotojas WHERE google_id = $1", 
                            [account.sub]
                        );
                        vartotojas = {
                            id: idQuery.rows[0].vartotojo_id,
                            isNewUser: true,
                        };
                    } else {
                        vartotojas = {
                            id: currentVartotojaQuery.rows[0].vartotojo_id,
                            isNewUser: false,
                        };
                    }
                } else {
                    // login mode
                    if (currentVartotojaQuery.rows.length > 0) {
                        vartotojas = {
                            id: currentVartotojaQuery.rows[0].vartotojo_id,
                            isNewUser: false,
                        };
                    } else {
                        // Not registered, redirect to signup
                        vartotojas = {
                            id: null,
                            isNewUser: true,
                        };
                    }
                }
                done(null, vartotojas);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.serializeUser((vartotojas, done) => {
    // uzkrauna info req.session.passport.vartotojas
    done(null, vartotojas);
});

passport.deserializeUser((vartotojas, done) => {
    // uzkrauna info req.user.vartotojas
    done(null,vartotojas);
    
});
