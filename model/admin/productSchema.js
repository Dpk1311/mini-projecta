const mongoose = require('mongoose');
const { Schema } = mongoose;


const productSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    Size: {
        type: Number,
        required: true
    },
    Quantity: {
        type: Number,
        required: true
    },
    Instock:{
        type: Boolean,
        default: true
    },
    
})

const productModel = new mongoose.model("Product", productSchema);

module.exports =  { productModel } 
