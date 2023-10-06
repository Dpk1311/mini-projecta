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

// const virtual = cartSchema.virtual('id');
// virtual.get(function () {
//     return this._id;
// });


// cartSchema.set('toJSON', {
//     virtuals: true,        
//     versionKey: false,     
//     transform: function (doc, ret) {
//         delete ret._id;    
//     },
// });

const cartModel = new mongoose.model('Cart', cartSchema);

module.exports =  cartModel  