const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')



router.get('/adminlogin',adminController.adminlogin)
router.post('/adminlogin',adminController.adminloginpost)
router.get('/adminhome',adminController.adminhome)







module.exports = router