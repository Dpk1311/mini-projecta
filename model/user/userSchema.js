const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
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

    address:[{
        type: Schema.Types.ObjectId,
        ref:'address',
        required:true
    }],
    selectedAddress: [{
        type: Schema.Types.ObjectId,
        ref: 'address'
    }],
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      
    }
});

const UserModel = new mongoose.model("User", UserSchema);

module.exports = { UserModel };
