const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require("dotenv").config();
require("./auth.js");
const profileRouter = require('./routers/profileRouter');


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
    secure: "process.env.NODE_ENV" === "production" ? true : "auto",
    sameSite: "process.env.NODE_ENV" === "production" ? "none" : "lax",
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
app.use( authRouter);

app.use(profileRouter); // mount to root




app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Option 1: Redirect to a frontend page
    // res.redirect(process.env.CLIENT_URL);

    res.redirect(`${process.env.CLIENT_URL}/create-profile`);

    // Option 2: Send user info as JSON
    // res.json(req.user);
  }
);


app.get('/api/jobs', (req, res) => {
  res.json([]);
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.get('/logout', (req, res) => {
  req.logout?.(); // for Passport.js
  req.session?.destroy?.();
  res.clearCookie('connect.sid');
  res.status(200).json({ message: 'Logged out' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});