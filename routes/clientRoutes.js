const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const cartController = require('../controllers/cartController')


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
router.get('/cartpost',cartController.addToCart) 
router.get('/userprofile',clientController.userprofile)
router.get('/addaddress',clientController.addaddress)
router.post('/addaddress',clientController.addaddresspost)



module.exports = router 