const cartModel = require('../model/user/cartSchema');
const { productModel } = require('../model/admin/productSchema');
const { UserModel } = require('../model/user/userSchema')
const { addressModel } = require('../model/user/addressSchema')
const Razorpay = require('razorpay')
const orderModel = require('../model/user/orderSchema')
const WishlistModel = require('../model/user/wishlistSchema')


const cart = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = req.session.user._id;
    console.log('uid:', userId);

    if (userId) {
      const cartData = await cartModel.findOne({ user: userId })
        .populate({
          path: 'products.product',
          model: 'Product', 
        });
      // console.log(cartData);

      let subtotal = 0;
      for (const item of cartData.products) {
        subtotal += item.product.Price * item.quantity;
      }

      // console.log('subtotal is', subtotal);

      // Fetch the user's name
      const user = await UserModel.findById(userId);
 
      
      const data = {
        user: user.name, 
        products: cartData.products, 
      };
      // console.log(data);
     
      const acceptHeader = req.get('Accept');

      if (acceptHeader.includes('application/json')) {
       
        res.json({ data, subtotal, user })
      } else {
       
        res.render('user/cart', { data, subtotal, user });
      }

    } else {
      if (req.accepts('application/json')) {
        res.json({ data: null,subtotal: null });
      } else {
        res.render('user/cart', { data: null , subtotal:null})
      }
    }
  } catch (error) {
    console.error(error);
  }
};


const addToCart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const userId = req.session.user._id 
      // console.log("userId", userId);
      const productId = req.params.productId 
      // console.log('productId:', productId);

      const product = await productModel.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      let userCart = await cartModel.findOne({ user: userId });
      // console.log('userCartis:', userCart);

      if (!userCart) {
        userCart = new cartModel({
          user: userId,
          products: [],
        });
      }

      const existingProduct = userCart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingProduct) {
        existingProduct.quantity += 1;

      }
      else {
        userCart.products.push({
          product: productId,
          quantity: 1,
          // price: product.price,
        });
      }


      await userCart.save();

      const userWishlist = await WishlistModel.findOne({ user: userId })
      // console.log('user wishlist', userWishlist);

      await WishlistModel.updateOne(
        { user: userId },
        { $pull: { products: productId } }
      )





      // console.log('cart saved');

      return res.redirect('/cart')
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
      const userId = req.session.user._id 
      // console.log("userId", userId);
      const productId = req.params.productId 
      // console.log('productId:', productId);


      let userCart = await cartModel.findOne({ user: userId });
      // console.log('userCart:', userCart);

      const existingProduct = userCart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingProduct) {
       
        existingProduct.quantity -= 1;

      }

      
      await userCart.save();
      // console.log('cart saved');

     
      return res.redirect('/cart'); 
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
      const userId = req.session.user._id; 
      const productId = req.params.productId; 

      let userCart = await cartModel.findOne({ user: userId });

      const existingProductIndex = userCart.products.findIndex((item) =>
        item.product.equals(productId)
      );

      if (existingProductIndex !== -1) {
        
        userCart.products.splice(existingProductIndex, 1);

       
        await userCart.save();
        console.log('product removed successfully');

       
        return res.redirect('/cart'); 
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
        model: 'Product', 
      });

    let subtotal = 0;
    for (const item of cartData.products) {
      subtotal += item.product.Price * item.quantity;
    }

    let total = (subtotal + 4.99).toFixed(2)

    const data = {
      user: user.name,
      products: cartData.products, 
      selectedAddress: user.selectedAddress, 
    }

    

    res.render('user/checkout', { user, data, subtotal, total })


  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}


const Keyid = process.env.RAZORPAY_KEY_ID
const Keysecret = process.env.RAZORPAY_KEY_SECRET

const payment = async (req, res) => {
  try {
    let { discountedPrice } = req.body;
    const amount = parseFloat(discountedPrice)
    // console.log('discount price',amount);

    var instance = new Razorpay({ key_id: Keyid, key_secret: Keysecret });

   
    let order = await instance.orders.create({
      amount: amount * 100, 
      currency: "INR",
      receipt: "receipt#1",
    });

    // console.log('orderdata is',order);

    res.status(201).json({
      success: true,
      order,
      amount
    });

  }
  catch (error) {
    console.error(error);
  }
};

const wishlist = async (req, res) => {
  const user = req.session.user
  const userid = req.session.user._id
  const wishlistdata = await WishlistModel.findOne({ user: userid }).populate('products')
  // console.log('wishlist', wishlistdata);

  res.render('user/wishlist', { user, wishlistdata })


}


const wishlistadd = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.user._id;

  let userWishlist = await WishlistModel.findOne({ user: userId });

  if (!userWishlist) {
    userWishlist = new WishlistModel({
      user: userId,
      products: [productId]
    });
  } else {
    // Check if the product already exists in the wishlist
    if (!userWishlist.products.includes(productId)) {
      userWishlist.products.push(productId);
    }
  } 

  await userWishlist.save();
  const acceptHeader = req.get('Accept');

  if (acceptHeader.includes('application/json')) {
   
    res.json('product added to wishlist')
  } else {
   
    res.redirect('/wishlist');
  }
}


const wishlistremove = async (req, res) => {
  const userId = req.session.user._id
  const productId = req.params.productId
  // console.log('delete id',productId);  

  const userWishlist = await WishlistModel.findOne({ user: userId })
  // console.log('user wishlist', userWishlist);

  await WishlistModel.updateOne(
    { user: userId },
    { $pull: { products: productId } }
  )

  res.redirect('/wishlist')
}


module.exports = {
  addToCart,
  cart,
  removefromcart,
  checkout,
  deleteFromCart,
  payment,
  wishlist,
  wishlistadd,
  wishlistremove
};