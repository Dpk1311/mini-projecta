



const authMiddleware = (req, res, next) => {
    // console.log(req.session.user);

    if (req.session.user || req.url === '/') {
        next();
    } else {
        res.redirect('/login')
    }
};


module.exports = authMiddleware 