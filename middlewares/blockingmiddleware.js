


const blockingmiddleware = async (req, res, next) => {
    const user = req.session.user
    // console.log('usermiddle frm data', user);

    if (user) {
        const block = user.block;
        // console.log('status', block);
        if (block === false) {
            next();  
        }
        else {
            req.session.destroy()
            res.redirect('/login');
        }
    } else {
        next();
    }

}

module.exports = blockingmiddleware;
