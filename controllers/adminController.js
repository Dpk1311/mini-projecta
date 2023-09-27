const {Admin} = require('../model/admin/adminSchema')
const {UserModel} = require('../model/user/userSchema')

const adminlogin = (req,res)=>{
    res.render('admin/login')
}

const adminloginpost = async (req,res)=>{
    try {
        const check = await Admin.findOne({ fullName: req.body.FullName });
        if (check) {
            if (req.body.password === check.password) {
                res.redirect('/adminhome');
            } else {
                res.send('Invalid Password');
            }
        } else {
            res.send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Wrong details');
    }
}

const adminhome = async (req,res)=>{
    try{
        console.log('1');
        const check = await UserModel.find();
        res.render('admin/adminhome',{ check })
    }
    catch(error){
        console.error('error in loading');
    }
    
}

const categorymanagement = 

module.exports = {
    adminlogin,adminloginpost,adminhome,
}