const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    gender:{
        type:String,
        enum:['Men','Women'],
        required:true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum:['Active','Inactive'],
        required: true
    },
    created_at: {
        type:Date,
        default:Date.now
    }

})

const CategoryModel = new mongoose.model("Category", categorySchema);

module.exports = { CategoryModel };
