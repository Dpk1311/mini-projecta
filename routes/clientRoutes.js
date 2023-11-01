const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middlewares/Authmiddleware')
const couponController = require('../controllers/couponController')

router.get('/',clientController.home)
router.get('/login',clientController.login)
router.post('/login',clientController.loginpost)
router.get('/logout',clientController.logout)
router.get('/signup',clientController.signup)
router.post('/signup',clientController.signuppost)
router.get('/otp', clientController.otp);
router.post('/otp',clientController.otppost)
router.get('/forgotpassword',clientController.forgotpassword)
router.post('/forgotpassword',clientController.forgotpasswordpost)
router.get('/product_shirts',clientController.product_shirts)
router.get('/productpage',clientController.productpage)
router.get('/cart',cartController.cart) 
router.get('/cartpost/:productId',cartController.addToCart)
router.get('/cartadd/:productId',cartController.addToCart) 
router.get('/cartremove/:productId',cartController.removefromcart) 
router.post('/deletecart/:productId',cartController.deleteFromCart)
router.get('/userprofile',clientController.userprofile) 
router.get('/addaddress',clientController.addaddress)
router.post('/addaddress',clientController.addaddresspost)
router.get('/edituser/:userId',clientController.edituser)
router.post('/edituser/:userId',clientController.editpost)
router.get('/checkout',cartController.checkout)
router.get('/payment/:amount',cartController.payment)
router.post('/addresssave',clientController.saveaddress)
router.get('/confirmpage',orderController.confirmpage)
router.get('/orders',orderController.orders)
router.get('/orderhistory',orderController.orderhistory)
router.get('/orderdetail',orderController.orderdetail)
router.post('/updateAddress',clientController.updateAddress)
router.get('/editaddress/:addressId',clientController.editaddress)
router.post('/editaddress/:addressId',clientController.editaddresspost)
router.get('/products',clientController.productsort)
router.get('/productsearch',clientController.productsearch)
router.post('/applycoupon',couponController.applycoupon)


module.exports = router 