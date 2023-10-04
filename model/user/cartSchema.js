const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    owner:{
        type:ObjectID,
        required:true,
        ref: 'User'
    },
    products:[{
        itemId:{
        type:ObjectID,
        ref:'Product',
        required:true
    },
    quantity:{
        type: Number,
        required:true,
        min:1,
        default:1},
        price:Number
    }],
    bill:{
        type:Number,
        required:true,
        default:0
    },
    created_at: {
        type:Date,
        default:Date.now
    }
})

const cartModel = mongoose.model('Cart',cartSchema)

module.exports = {cartModel}