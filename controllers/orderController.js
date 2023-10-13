const OrderModel = require('../model/user/orderSchema')
const { UserModel } = require('../model/user/userSchema')
const cartModel = require('../model/user/cartSchema');



const orders = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
        .populate('selectedAddress');
        console.log('orders',user.selectedAddress);
        const cartData = await cartModel.findOne({ user: userid })
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
        console.log('cartdata is', cartData);

        let subtotal = 0
        for (const item of cartData.products) {
            subtotal += item.product.Price * item.quantity
        }
        const addressId = req.session.selectedAddressId
        console.log('address is',addressId);

        const orderData = {
            user: user._id, // Store user's ID
            products: cartData.products,
            totalAmount: subtotal+4.99, 
            shippingAddress: user.selectedAddress, // Use the selected address
            paymentMethod: 'Cash on Delivery', // Example payment method
        };

        // Create a new order document and save it to the database
        const newOrder = new OrderModel(orderData);
        await newOrder.save();

        // After saving the order, you can clear the user's shopping cart or take any other necessary actions.

        res.redirect('/confirmpage');

    }  
    catch (error) {
        console.error(error);
    }
}


const confirmpage = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress')

        const cartData = await cartModel.findOne({ user: userid })
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })


        let subtotal = 0
        for (const item of cartData.products) {
            subtotal += item.product.Price * item.quantity
        }

        const data = {
            user: user.name, // Include the user's name
            products: cartData.products, // Include the cart products
            selectedAddress: user.selectedAddress, // Include the selected address
        }
        res.render('user/confirmpage', { user, data, subtotal })
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = {
    orders, confirmpage
}