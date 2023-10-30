const authMiddleware = (req, res, next) => {
    const user = req.session.user
    console.log('user is',user);
    if (user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};


module.exports = authMiddleware