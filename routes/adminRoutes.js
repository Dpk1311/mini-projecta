const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Specify the destination folder
    },
    filename: (req, file, cb) => {
        // Generate a unique file name (you can use Date.now() or any other method)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });




router.get('/adminlogin', adminController.adminlogin)
router.post('/adminlogin', adminController.adminloginpost)
router.get('/adminhome', adminController.adminhome)
router.get('/productmanagement', adminController.productmanagement)
router.get('/addproduct', adminController.addproduct)
router.post('/addproduct',upload.single('Image'),adminController.addproductpost)
router.get('/categorymanagement',adminController.categorymanagement)
router.get('/addcategory',adminController.addcategory)
router.post('/addcategory',upload.single('image'),adminController.addcategorypost)







module.exports = router