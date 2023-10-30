const cartModel = require('../model/user/cartSchema');
const { productModel } = require('../model/admin/productSchema');
const { UserModel } = require('../model/user/userSchema')
const { addressModel } = require('../model/user/addressSchema')
const Razorpay = require('razorpay')


const cart = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = req.session.user._id;
    console.log('uid:', userId);

    if (userId) {
      const cartData = await cartModel.findOne({ user: userId })
        .populate({
          path: 'products.product',
          model: 'Product', // Replace with your product model name
        });
        console.log(cartData);

      let subtotal = 0;
      for (const item of cartData.products) {
        subtotal += item.product.Price * item.quantity;
      }

      // console.log('subtotal is', subtotal);

      // Fetch the user's name
      const user = await UserModel.findById(userId);

      // Combine the user's name with the cart data
      const data = {
        user: user.name, // Include the user's name
        products: cartData.products, // Include the cart products
      };

      // Check the request's 'Accept' header to determine the response type
      const acceptHeader = req.get('Accept');

      if (acceptHeader.includes('application/json')) {
        // Send JSON response
        res.json({ data, subtotal, user });
      } else {
        // Render EJS (HTML) response
        res.render('user/cart', { data, subtotal, user });
      }
      
    } else {
      if (req.accepts('application/json')) {
        // Send JSON response
        res.json({ data: null });
      } else {
        // Render EJS (HTML) response
        res.render('user/cart', { data: null });
      }
    }
  } catch (error) {
    console.error(error);
  }
};


const addToCart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const userId = req.session.user._id // Assuming you have user information in the session
      // console.log("userId", userId);
      const productId = req.params.productId // Assuming the product ID is passed as a query parameter
      // console.log('productId:', productId);

      // Find the product by ID 
      const product = await productModel.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if the user already has a cart
      let userCart = await cartModel.findOne({ user: userId });
      // console.log('userCartis:', userCart);

      if (!userCart) {
        // Create a new cart for the user if it doesn't exist
        userCart = new cartModel({
          user: userId,
          products: [],
        });
      }

      // Check if the product is already in the user's cart
      const existingProduct = userCart.products.find((item) =>
        item.product.equals(productId)
      ); 

      if (existingProduct) {
        // If the product is already in the cart, increase the quantity
        existingProduct.quantity += 1;

      }
      else {
        // If not, add it to the cart with quantity 1
        userCart.products.push({
          product: productId,
          quantity: 1,
          // price: product.price, // You may need to adjust this based on your schema
        });
      }


      // Save the updated cart
      await userCart.save();
      // console.log('cart saved');

      // Redirect or respond with a success message
      return res.redirect('/cart'); // You can redirect the user to their cart page
    } else {
      console.log('session not found');
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removefromcart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const userId = req.session.user._id // Assuming you have user information in the session
      // console.log("userId", userId);
      const productId = req.params.productId // Assuming the product ID is passed as a query parameter
      // console.log('productId:', productId);


      let userCart = await cartModel.findOne({ user: userId });
      // console.log('userCart:', userCart);

      const existingProduct = userCart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingProduct) {
        // If the product is already in the cart, increase the quantity
        existingProduct.quantity -= 1;

      }

      // Save the updated cart
      await userCart.save();
      // console.log('cart saved');

      // Redirect or respond with a success message
      return res.redirect('/cart'); // You can redirect the user to their cart page
    } else {
      console.log('session not found');
    }
  }
  catch (error) {
    console.error(error);
  }
}



const deleteFromCart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const userId = req.session.user._id; // Assuming you have user information in the session
      const productId = req.params.productId; // Assuming the product ID is passed as a parameter

      let userCart = await cartModel.findOne({ user: userId });

      const existingProductIndex = userCart.products.findIndex((item) =>
        item.product.equals(productId)
      );

      if (existingProductIndex !== -1) {
        // If the product is in the cart, remove it from the array
        userCart.products.splice(existingProductIndex, 1);

        // Save the updated cart
        await userCart.save();
        console.log('product removed successfully');

        // Redirect or respond with a success message
        return res.redirect('/cart'); // You can redirect the user to their cart page
      } else {
        return res.status(404).json({ error: 'Product not found in cart' });
      }
    } else {
      console.log('Session not found');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const checkout = async (req, res) => {
  try {

    const userid = req.session.user._id;

    const user = await UserModel.findById(userid)
      .populate('selectedAddress')
      .populate('address');

    const cartData = await cartModel.findOne({ user: userid })
      .populate({
        path: 'products.product',
        model: 'Product', // Replace with your product model name
      });

    let subtotal = 0;
    for (const item of cartData.products) {
      subtotal += item.product.Price * item.quantity;
    }

    const data = {
      user: user.name, // Include the user's name
      products: cartData.products, // Include the cart products
      selectedAddress: user.selectedAddress, // Include the selected address
    }

    res.render('user/checkout', { user, data, subtotal })


  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}


const payment = async (req, res) => {
  try {
    let { amount } = req.params
    const amount1 = parseFloat(amount)
    // console.log('amount is', amount1)

    var instance = new Razorpay({ key_id: 'rzp_test_46W9ONQBaPn6A8', key_secret: 'uKnujHxXw6cmPrUdFabchtEe' });

    // Create a Razorpay order
    let order = await instance.orders.create({
      amount: amount1 * 100,
      currency: "INR",
      receipt: "receipt#1",
    })

    // console.log('order is',order);



    res.status(201).json({
      success: true,
      order,
      amount
    })

  }
  catch (error) {
    console.error(error);
  }
}



module.exports = {
  addToCart,
  cart,
  removefromcart,
  checkout,
  deleteFromCart,
  payment
};
