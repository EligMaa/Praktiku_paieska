const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

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
app.use("/auth", authRouter);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});