const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
require("dotenv").config();
require("./auth.js");
const profileRouter = require('./routers/profileRouter');
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


app.use(passport.initialize());
app.use(passport.session());

const indexRouter = require('./routers/indexRouter');
app.use("/", indexRouter);

const authRouter = require('./routers/authRouter');
// app.use("/", authRouter);
app.use(authRouter);

app.use(profileRouter); // mount to root

// File download route with proper content types
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type
    
    // Set appropriate content type based on file extension
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

    // Send file with proper content type
    res.setHeader('Content-Type', contentType);
    // Set content disposition to make browser download or display inline based on file type
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    fs.createReadStream(filePath).pipe(res);
  });
});


// Removed the basic jobs endpoint as it's now handled by jobRouter

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
      // First, get the user's role
      const userResult = await pool.query(
        "SELECT * FROM vartotojas WHERE vartotojo_id = $1",
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.json(req.user);
      }
      
      const userRole = userResult.rows[0].role;
      let profileData = { ...req.user, role: userRole };
      
      // Then, based on the role, get the additional profile information
      if (userRole === 'studentas') {
        const studentResult = await pool.query(
          "SELECT * FROM stud_profilis WHERE studento_id = $1",
          [req.user.id]
        );
        
        if (studentResult.rows.length > 0) {
          console.log("Student profile data found:", studentResult.rows[0]);
          
          // Convert case for consistency in field names
          const studentData = studentResult.rows[0];
          const processedData = {};
          
          // Map database column names to frontend expected names (lowercase)
          Object.keys(studentData).forEach(key => {
            // Convert CV_original_filename to cv_original_filename for frontend
            if (key === 'cv_original_filename' || key === 'CV_original_filename') {
              processedData['cv_original_filename'] = studentData[key];
            } 
            // Convert CV_failo_kelias to cv_failo_kelias for frontend
            else if (key === 'cv_failo_kelias' || key === 'CV_failo_kelias') {
              processedData['cv_failo_kelias'] = studentData[key];
            }
            else {
              // Keep other keys with original casing
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