const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure emails are unique
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    otp: String, // Store OTP
    otpExpiration: {
        type: Date,
        default: Date.now,
        // Set an expires index for otpExpiration field to automatically delete documents after 5 minutes
        expires: 300 // 300 seconds (5 minutes)
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    }
    // You can add more fields common to both login and signup if needed
});

const UserModel = new mongoose.model("User", UserSchema);

module.exports = { UserModel };
