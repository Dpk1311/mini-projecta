const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const otpController  = require('../controllers/otpController')


router.get('/',clientController.home)
router.get('/login',clientController.login)
router.post('/login',clientController.loginpost)
router.get('/signup',clientController.signup)
router.post('/signup',clientController.signuppost)
router.get('/otp', clientController.otp);
router.get('/product_shirts',clientController.product_shirts)
router.get('/productpage',clientController.productpage)
// router.post('/verify-otp', otpController.verifyOTP);




module.exports = router 