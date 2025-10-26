const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
require("dotenv").config();
require("./auth.js");
const pool = require('./db');


const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    cors({
      credentials: true,
        origin: process.env.CLIENT_URL,
    })
);

app.use(session({
  secret: process.env.COOKIE_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  resave: false,
  saveUninitialized: false,
  })
);

// vartotojo autentifikacijai
app.use(passport.initialize());
app.use(passport.session());

const indexRouter = require('./routers/indexRouter');
app.use("/", indexRouter);

const authRouter = require('./routers/authRouter');
app.use(authRouter);

const profileRouter = require('./routers/profileRouter');
app.use(profileRouter); 

// Filu atsisiuntimo endpointas
// :filename yra dinaminis parametras, kuris nurodo, kokį failą vartotojas nori atsisiųsti
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type
    
    // nustatomas turinios tipas pagal failo pletini
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }

    res.setHeader('Content-Type', contentType);
    // inline reiškia, kad failas bus rodomas naršyklėje
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // TODO: failas turi puti skaitomas is duomenu bazes. pakeisti saugojima
    fs.createReadStream(filePath).pipe(res);
  });
});



app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return res.status(500).json({ error: 'Logout failed' }); }
    req.session?.destroy?.();
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out' });
  });
});

app.get('/account', async (req, res) => {
  if (req.user) {
    try {
      // vartotojo pagrindine informacija
      const userResult = await pool.query(
        "SELECT * FROM vartotojas WHERE vartotojo_id = $1",
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.json(req.user);
      }
      
      const userRole = userResult.rows[0].role;
      let profileData = { ...req.user, role: userRole };
      
      // pagal role paimama papildoma informacija is atitinkamu profiliu lenteliu
      if (userRole === 'studentas') {
        const studentResult = await pool.query(
          "SELECT * FROM stud_profilis WHERE studento_id = $1",
          [req.user.id]
        );
        
        if (studentResult.rows.length > 0) {
          console.log("Student profile data found:", studentResult.rows[0]);
          
          const studentData = studentResult.rows[0];
          const processedData = {};
          
          Object.keys(studentData).forEach(key => {
            
            if (key === 'cv_original_filename' || key === 'CV_original_filename') {
              processedData['cv_original_filename'] = studentData[key];
            } 
            else if (key === 'cv_failo_kelias' || key === 'CV_failo_kelias') {
              processedData['cv_failo_kelias'] = studentData[key];
            }
            else {
              processedData[key.toLowerCase()] = studentData[key];
            }
          });
          
          profileData = { ...profileData, ...processedData };
        } else {
          console.log("No student profile data found for user ID:", req.user.id);
        }
      } else if (userRole === 'imone') {
        const companyResult = await pool.query(
          "SELECT * FROM imones_profilis WHERE imones_id = $1",
          [req.user.id]
        );
        
        if (companyResult.rows.length > 0) {
          console.log("Company profile data found:", companyResult.rows[0]);
          profileData = { ...profileData, ...companyResult.rows[0] };
        } else {
          console.log("No company profile data found for user ID:", req.user.id);
        }
      }
      
      console.log("Final profile data being sent:", profileData);
      res.json(profileData);
    } catch (err) {
      console.error('Error fetching user profile data:', err);
      res.json(req.user);
    }
  } else {
    res.status(401).json({});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});