const isAuth = (req, res, next) => {
    if (req.user) {
        return next();
    } else {
        return res.json({loggedIn: false});
    }
}

module.exports = isAuth;