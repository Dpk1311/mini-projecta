const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
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
router.post('/addproduct',upload.array('Image',5),adminController.addproductpost)
router.get('/categorymanagement',adminController.categorymanagement)
router.get('/addcategory',adminController.addcategory)
router.post('/addcategory',upload.single('image'),adminController.addcategorypost)
router.get('/usersearch',adminController.usersearch)
router.get('/userblock/:userId',adminController.userblock)
router.get('/userUnblock/:userId',adminController.userUnblock)
router.get('/ordermanagement',adminController.ordermanagement)
router.get('/orderstatusupdate/:orderid',adminController.orderstatusupdate)





module.exports = router