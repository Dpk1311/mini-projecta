const nodemailer = require('nodemailer');
const { UserModel } = require('../model/user/userSchema');
const { CategoryModel } = require('../model/admin/categorySchema')
const { productModel } = require('../model/admin/productSchema')
const { addressModel } = require('../model/user/addressSchema')


//  to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const home = async (req, res) => {
    try {

        const user = req.session.user
        const categorycollection = await CategoryModel.find()
        // console.log(categorycollection);
        res.render('user/home', { categorycollection, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const login = (req, res) => {
    if (req.session.invalid) {
        req.session.invalid = false
        return res.render('user/login', { msg: req.session.errormsg || '' })
    } else if (req.session.user) {
        res.render('user/home', { msg: '' })
    }
    else {
        res.render('user/login', { msg: '' })
    }
}

const loginpost = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            req.session.invalid = true;
            req.session.errormsg = "Incorrect Email";
            return res.redirect('/login');
        }

        // Compare the provided password with the stored password
        if (user.password === password) {
            req.session.user = user;
            req.session.useremail = email
            return res.redirect('/');
        }
        else {
            req.session.invalid = true;
            req.session.errormsg = "Incorrect Password";
            return res.redirect('/login');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

const logout = (req, res) => {
    req.session.user = null;
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            res.redirect('/login');
        }
    });
};

const forgotpassword = (req, res) => {
    const msg = req.query.msg
    res.render('user/forgotpassword', { msg })
}

const forgotpasswordpost = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            const otp = generateOTP();

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'j29589289@gmail.com',
                    pass: 'potl opgm ojjr cbfn',
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: 'j29589289@gmail.com',
                to: email,
                subject: 'OTP Verification',
                text: `Your OTP for verification is: ${otp}`,
            };

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Error sending OTP via email');
                } else {
                    console.log('Email sent: ' + info.response);

                    // Set OTP expiration time (e.g., 5 minutes)
                    // user.otp = otp;
                    // user.otpExpiration = Date.now() + 5 * 60 * 1000;
                    // await user.save();

                    // Redirect to the OTP verification page
                    res.redirect('/otp');
                }
            });
        } else {
            // Email does not exist in the database
            res.redirect('/forgotpassword?msg=Invalid Valid Mail');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const signup = (req, res) => {
    res.render('user/signup');
};


const signuppost = async (req, res) => {
    try {
        // Get user input from the signup form
        const { name, email, password, phoneNumber } = req.body;
        console.log('Received signup request:', name, email, phoneNumber);

        // Generate an OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Create a new document using the UserModel
        const newUser = new UserModel({
            name,
            email,
            password,
            phoneNumber,
        });

        // Save the new user to the database
        await newUser.save();
        console.log('User saved to database');

        // Send the OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'j29589289@gmail.com',
                pass: 'potl opgm ojjr cbfn',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'j29589289@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error sending OTP via email');
            } else {
                console.log('Email sent: ' + info.response);

                // Set OTP expiration time (5 minutes)
                newUser.otp = otp;
                newUser.otpExpiration = Date.now() + 5 * 60 * 1000;
                await newUser.save();

                // Redirect to the OTP verification page
                res.redirect('/otp');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const otp = (req, res) => {
    res.render('user/otp');
};

const otppost = async (req, res) => {
    try {
        const { otp } = req.body
        const user = await UserModel.findOne({ otp })
        if (!user) {
            res.redirect('/otp')
        }

        else if (user) {

            user.otp = null;
            await user.save();


            res.redirect('/');
            user.isOtpVerified = true
            await user.save();

        } else {

            res.redirect('/otp');
        }

    } catch (error) {
        console.error(error);
    }
}

const userprofile = (req, res) => {
    try {
        const user = req.session.user
        console.log('user:', user);
        if (user) {
            res.render('user/userprofile', { user })
        }
    }
    catch (error) {
        console.error(error);
    }
}

const addaddress = (req, res) => {
    try {
        if (req.session.user) {
            res.render('user/addaddress')
        }
    }
    catch (error) {
        console.error(error);
    }
}

const addaddresspost = async (req,res) =>{
    try{
       const usermail = req.session.useremail
        const{street,city,state,pincode,country} = req.body
        const verifymail = await UserModel.findOne({email:usermail})
            if(!verifymail){
                res.redirect('/')
            }
        const newAddress = new addressModel({
            street,
            city,
            state,
            pincode,
            country
        })
        await newAddress.save()

        verifymail.address.push(newAddress)
        await verifymail.save()
        console.log('newaddress saved to database');
        res.redirect('/userprofile')

    }
    catch(error){
        console.error(error);
    }
}

const productpage = async (req, res) => {
    const itemid = req.query.product_Id
    const productdisplay = await productModel.findById(itemid)
    res.render('user/productpage', { productdisplay })
}

const product_shirts = async (req, res) => {
    const productcollection = await productModel.find()
    res.render('user/product_shirts', { productcollection })
}


module.exports = {
    home,
    login,
    loginpost,
    logout,
    signup,
    signuppost,
    otp,
    product_shirts,
    productpage,
    otppost,
    forgotpassword,
    forgotpasswordpost,
    userprofile,
    addaddress,
    addaddresspost

};
