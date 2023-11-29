const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        quantity: {
            type: Number,
            required: true
        },
        product: { 
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }]
});


const cartModel = new mongoose.model('Cart', cartSchema);

module.exports =  cartModel  