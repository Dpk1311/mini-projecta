const OrderModel = require('../model/user/orderSchema')
const { UserModel } = require('../model/user/userSchema')
const cartModel = require('../model/user/cartSchema');


const orders = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress');
        console.log('orders', user);
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


        let discountedPrice = req.query.discountedPrice;
        totalfinal = discountedPrice

        const orderData = {
            user: user._id, // Store user's ID
            products: cartData.products,
            totalAmount: totalfinal,
            shippingAddress: user.selectedAddress[0], // Use the selected address
            paymentMethod: 'Cash on Delivery', // Example payment method
        };

        // console.log('database orderdata',orderData);
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

        const cartData = await OrderModel.findOne({ user: userid })
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
            .sort({ orderDate: -1 })


        let subtotal = 0
        for (const item of cartData.products) {
            subtotal += item.product.Price * item.quantity
        }

        const data = {
            user: user.name, // Include the user's name
            products: cartData.products, // Include the cart products
            selectedAddress: user.selectedAddress,// Include the selected address
            total: cartData.totalAmount

        }
        res.render('user/confirmpage', { user, data, subtotal })
    }
    catch (error) {
        console.error(error);
    }
}


const orderhistory = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress')
        // console.log('user is',user);
        const orderData = await OrderModel.find({ user: userid })
            .populate({
                path: 'products.product', // Use 'path' to specify the nested reference
                model: 'Product' // Replace with your product model name

            })
            .populate({
                path: 'shippingAddress',
                model: 'address', // Replace with your address model name
            });

        console.log('orderdata is', orderData);

        // Check if the cancel button is clicked
        if (req.query.cancelOrderId) {
            const orderId = req.query.cancelOrderId;
            console.log(orderId);
            const order = await OrderModel.findById(orderId);
            console.log(order);

            // Check if the order status is "Order Pending"
            if (order.Status === 'OrderPending') {
                order.Status = 'Order Cancelled';
                await order.save();
                console.log('order cancelled');
            }
        }

        // console.log('order data', orderData);
        res.render('user/orderhistory', { user, orderData });
    }
    catch (error) {
        console.error(error)
    }
}


const orderdetail = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
        const orderId = req.query.orderId
        const orderData = await OrderModel.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
            .populate({
                path: 'shippingAddress',
                model: 'address', // Replace with your address model name
            });
        // console.log('orderdata is', orderData);

        // Combine the user's name with the cart data
        // const data = {
        //     user: user.name, // Include the user's name
        //     products: orderData.products, // Include the cart products
        // };

        // console.log('detail data',data);

        res.render('user/orderdetailpage', { user, orderData })

    }
    catch (error) {
        console.error(error);
    }
}






module.exports = {
    orders, confirmpage, orderhistory, orderdetail,
}