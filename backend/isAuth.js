const isAuth = (req, res, next) => {
    if (req.vartotojas) next();
    res.json({loggedIn: false});
    
}

module.exports = isAuth;