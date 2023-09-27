const nodemailer = require('nodemailer');
const { UserModel } = require('../model/user/userSchema');

// Function to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const home = async (req, res) => {
    try {
        res.render('user/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const login = (req, res) => {
    res.render('user/login');
};

const loginpost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email, password });

        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/login');
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
        const { fullName, email, password, phoneNumber } = req.body;
        console.log('Received signup request:', fullName, email, phoneNumber);

        // Generate an OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Create a new document using the UserModel
        const newUser = new UserModel({
            fullName,
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
                user: 'j29589289@gmail.com', // your email address
                pass: 'potl opgm ojjr cbfn', // your email password
            },
            tls: {
                rejectUnauthorized: false // Add this line
            } 
        });

        const mailOptions = {
            from: 'j29589289@gmail.com',
            to: email, // User's email from the signup form
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

const product_shirts = (req,res) =>{
    res.render('user/product_shirts')
}


module.exports = {
    home,
    login,
    loginpost,
    signup,
    signuppost,
    otp,
    product_shirts
    // verifyOTP,
};
