const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    image:{
        type:image,
        required:true
    }
    
})

const CategoryModel = new mongoose.model("Category", categorySchema);

module.exports = { CategoryModel };
