const { cartModel } = require('../model/user/cartSchema')
const {ProductModel} = require('../model/admin/productSchema')

const cart = async (req,res)=>{
    try{
        const data = await cartModel.find()
        console.log('data:',data);
        res.render('user/cart',)
    }
    catch(error){
        console.error(error);
    }
}




module.exports = {
    cart,
}