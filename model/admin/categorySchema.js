const mongoose = require('mongoose');

const categorySchema = new mongoose.model({
    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    }
    
})

const CategoryModel = new mongoose.model("Category", categorySchema);

module.exports = { CategoryModel };
