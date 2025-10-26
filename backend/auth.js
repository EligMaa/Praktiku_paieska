const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const pool = require('./db');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,  // URL kuria Google nukreips po autentifikacijos
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            // autentifikacijos logika
            const account = profile._json;
            let vartotojas = {};
            try {
                console.log('Google profile:', account);
                const currentVartotojaQuery = await pool.query(
                    "SELECT * FROM vartotojas WHERE google_id = $1", 
                    [account.sub]
                );
                console.log('Existing user query result:', currentVartotojaQuery.rows);

                // Use session to get mode (signup or login)
                const mode = req.session.authMode || 'login';
                console.log('Auth mode:', mode);

                if (mode === 'signup') {
                    if (currentVartotojaQuery.rows.length === 0) {
                        const role = 'unspecified'; // laikina role kuria vliau kuriant profili privales pasirinkt
                        const insertRes = await pool.query(
                            "INSERT INTO vartotojas (google_id, role) VALUES ($1, $2)", 
                            [account.sub, role]
                        );
                        console.log('Insert result:', insertRes);
                        const idQuery = await pool.query(
                            "SELECT vartotojo_id FROM vartotojas WHERE google_id = $1", 
                            [account.sub]
                        );
                        console.log('ID query result:', idQuery.rows);
                        vartotojas = {
                            id: idQuery.rows[0]?.vartotojo_id || null,
                            isNewUser: true,
                            name: account.name,
                            given_name: account.given_name,
                            family_name: account.family_name,
                            email: account.email,
                            picture: account.picture
                        };
                    } else {
                        vartotojas = {
                            id: currentVartotojaQuery.rows[0].vartotojo_id,
                            isNewUser: false,
                            name: account.name,
                            given_name: account.given_name,
                            family_name: account.family_name,
                            email: account.email,
                            picture: account.picture
                        };
                    }
                } else {
                    // Prisijungimas
                    if (currentVartotojaQuery.rows.length > 0) {
                        vartotojas = {
                            id: currentVartotojaQuery.rows[0].vartotojo_id,
                            isNewUser: false,
                            name: account.name,
                            given_name: account.given_name,
                            family_name: account.family_name,
                            email: account.email,
                            picture: account.picture
                        };
                    } else {
                        // Jei vartotojas bando prisijungti, bet jo nera duomenu bazeje
                        console.log('User not found in database, creating new user object');
                        vartotojas = {
                            id: null,
                            isNewUser: true,
                        };
                    }
                }
                console.log('Final user object for session:', vartotojas);
                done(null, vartotojas);
            } catch (error) {
                console.error('GoogleStrategy error:', error);
                done(error);
            }
        }
    )
);
passport.serializeUser((vartotojas, done) => {
    //  issaugo vartotojo duomenis į sesiją po prisijungimo
    done(null, vartotojas);
});

passport.deserializeUser((vartotojas, done) => {
    // is sesijos duomenų užkrauna vartotojo duomenis su kiekviena užklausa
    done(null,vartotojas);
    
});
