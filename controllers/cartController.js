const cartModel = require('../model/user/cartSchema');
const { productModel } = require('../model/admin/productSchema');
const { UserModel } = require('../model/user/userSchema')




const cart = async (req, res) => {
  try {
    const user = req.session.user
    const userId = req.session.user._id
    console.log('uid:', userId);
    if (userId) {
      const cartData = await cartModel.findOne({ user: userId })
        .populate({
          path: 'products.product',
          model: 'Product', // Replace with your product model name
        });
      console.log('cartdata:', cartData);


      let subtotal = 0
      for (const item of cartData.products) {
        subtotal += item.product.Price * item.quantity
      }
      // Fetch the user's name
      const user = await UserModel.findById(userId);

      // Combine the user's name with the cart data
      const data = {
        user: user.name, // Include the user's name
        products: cartData.products, // Include the cart products
      };

      // const data1 = {
      //   Owner: user._id
      // } 
      // console.log('data1', data1);

      res.render('user/cart', { data, subtotal, user })
    } else {
      res.render('user/cart', { data: null })
    }

  }
  catch (error) {
    console.error(error);
  }
}

const addToCart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const userId = req.session.user._id // Assuming you have user information in the session
      console.log("userId", userId);
      const productId = req.params.productId // Assuming the product ID is passed as a query parameter
      console.log('productId:', productId);

      // Find the product by ID 
      const product = await productModel.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if the user already has a cart
      let userCart = await cartModel.findOne({ user: userId });
      console.log('userCart:', userCart);

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
      console.log('cart saved');

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
      console.log("userId", userId);
      const productId = req.params.productId // Assuming the product ID is passed as a query parameter
      console.log('productId:', productId);


      let userCart = await cartModel.findOne({ user: userId });
      console.log('userCart:', userCart);

      const existingProduct = userCart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingProduct) {
        // If the product is already in the cart, increase the quantity
        existingProduct.quantity -= 1;

      }

      // Save the updated cart
      await userCart.save();
      console.log('cart saved');

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

const checkout = async (req, res) => {
  try {
    const userid = req.session.user._id
    console.log(userid);
    const user = await UserModel.findById(userid)
    console.log('user ixs', user);
    const cartData = await cartModel.findOne({ user: userid })
    console.log('cartdata is', cartData);
    const data = {
      user: user.name, // Include the user's name
      products: cartData.products, // Include the cart products
    }
    res.render('user/checkout', { user,data })
  }
  catch (error) {
    console.error(error);
  }
}

module.exports = {
  addToCart,
  cart,
  removefromcart,
  checkout
};
