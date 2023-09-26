// otpController.js

// Import any necessary modules
const { UserModel } = require('../model/user/userSchema');
const nodemailer = require('nodemailer');

// Function to handle OTP verification
const verifyOTP = async (req, res) => {
    try {
        // Extract OTP from the request body
        const { otp } = req.body;

        // Get the user associated with the provided OTP
        const user = await UserModel.findOne({ otp });

        if (user) {
            // OTP is valid; you can perform additional actions here
            // For example, you can update the user's status or log them in
            // Then, you can delete the OTP from the user document
            user.otp = null;
            await user.save();

            // Redirect to a success page or perform further actions
            res.redirect('/success'); // Customize the redirect URL
        } else {
            // Invalid OTP; you can redirect to an error page or display an error message
            res.redirect('/error'); // Customize the error redirect URL
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Export the OTP verification function
module.exports = {
    verifyOTP,
};
