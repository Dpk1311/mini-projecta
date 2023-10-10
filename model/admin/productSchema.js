const mongoose = require('mongoose');
const { Schema } = mongoose;


const productSchema = new Schema({
    Owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      
    },
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Image: {
        type: [String],
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Discount: {
        type: Number,
        required: true
    },
    Brand: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Size: {
        type: Number,
        required: true
    },
    Quantity: {
        type: String,
        required: true
    }

})

const productModel = new mongoose.model("Product", productSchema);

module.exports =  { productModel } 
