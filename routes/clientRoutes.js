const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middlewares/Authmiddleware')
const blockingmiddleware = require('../middlewares/blockingmiddleware')
const couponController = require('../controllers/couponController')
const walletController = require('../controllers/walletController')

router.get('/login', clientController.login)
router.post('/login',clientController.loginpost)
router.get('/', blockingmiddleware, authMiddleware, clientController.home)
router.get('/logout',clientController.logout)
router.get('/signup',clientController.signup)
router.post('/signup',clientController.signuppost)
router.get('/otp', clientController.otp);
router.post('/otp',clientController.otppost)
router.get('/otpresend',clientController.otpresend)
router.get('/forgotpassword',clientController.forgotpassword)
router.post('/forgotpassword',clientController.forgotpasswordpost)
router.post('/updatepassword/:oldpassword/:newpassword',clientController.updatepassword)
router.get('/product_shirts',blockingmiddleware,clientController.product_shirts)
router.get('/productpage',blockingmiddleware,clientController.productpage)
router.get('/wishlist',authMiddleware,blockingmiddleware,cartController.wishlist)
router.get('/wishlistadd/:productId',authMiddleware,blockingmiddleware,cartController.wishlistadd)
router.get('/cart',authMiddleware,blockingmiddleware,cartController.cart) 
router.get('/cartpost/:productId',cartController.addToCart)
router.get('/cartadd/:productId',cartController.addToCart) 
router.get('/cartremove/:productId',cartController.removefromcart) 
router.post('/deletecart/:productId',cartController.deleteFromCart)
router.get('/userprofile', authMiddleware,blockingmiddleware,clientController.userprofile) 
router.get('/addaddress', authMiddleware,clientController.addaddress)
router.post('/addaddress', authMiddleware,clientController.addaddresspost)
router.get('/edituser', authMiddleware,clientController.edituser)
router.post('/edituser', authMiddleware,clientController.editpost)
router.get('/checkout', authMiddleware,blockingmiddleware,cartController.checkout)
router.post('/payment/:amount', authMiddleware,cartController.payment)
router.post('/addresssave', authMiddleware,clientController.saveaddress)
router.get('/confirmpage', authMiddleware,blockingmiddleware,orderController.confirmpage)
router.get('/orders', authMiddleware,orderController.orders)
router.get('/orderhistory', authMiddleware,blockingmiddleware,orderController.orderhistory)
router.post('/ordercancel/:orderid', authMiddleware,orderController.ordercancel)
router.get('/orderdetail', authMiddleware,blockingmiddleware,orderController.orderdetail) 
router.post('/updateAddress', authMiddleware,clientController.updateAddress)
router.get('/editaddress/:addressId', authMiddleware,clientController.editaddress)
router.post('/editaddress/:addressId', authMiddleware,clientController.editaddresspost)
router.get('/products',clientController.productsort)
router.get('/productsearch',clientController.productsearch)
router.post('/applycoupon',couponController.applycoupon)
router.get('/wallet',blockingmiddleware,walletController.wallet)
router.get('/walletadd/:totalAmount/:orderid', walletController.walletadd)
router.post('/addressdelete/:addressid',clientController.deleteaddress)


module.exports = router 