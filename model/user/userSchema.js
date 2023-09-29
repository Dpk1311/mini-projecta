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
    otp: {
        type:String,
        otpExpiration: {
            type: Date,
            default: Date.now,
            expires: 300 // 300 seconds (5 minutes)
        }
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    block:{
        type: Boolean,
        default: false
    },
});

const UserModel = new mongoose.model("User", UserSchema);

module.exports = { UserModel };
