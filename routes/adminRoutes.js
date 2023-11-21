const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const couponController = require('../controllers/couponController')
const multer = require('multer')
const adminauthmiddleware = require('../middlewares/adminauthmiddleware')


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
router.get('/adminhome',adminauthmiddleware, adminController.adminhome)
router.get('/adminlogout',adminController.adminlogout)
router.get('/productmanagement',adminauthmiddleware, adminController.productmanagement)
router.get('/addproduct',adminauthmiddleware, adminController.addproduct)
router.post('/addproduct',upload.array('Image',5),adminController.addproductpost)
router.get('/categorymanagement',adminauthmiddleware,adminController.categorymanagement)
router.get('/addcategory',adminauthmiddleware,adminController.addcategory)
router.post('/addcategory',upload.single('image'),adminController.addcategorypost)
router.get('/editcategory/:productId',adminauthmiddleware,adminController.editcategory)
router.post('/editcategory/:productId',upload.single('Image'),adminController.editcategorypost)
router.get('/categorydelete/:productId',adminauthmiddleware,adminController.categorydelete)
router.get('/usersearch',adminauthmiddleware,adminController.usersearch)
router.get('/userblock/:userId',adminauthmiddleware,adminController.userblock)
router.get('/userUnblock/:userId',adminController.userUnblock)
router.get('/ordermanagement',adminController.ordermanagement)
router.get('/adminorderdetail',adminauthmiddleware,adminController.adminoderdetail)
router.get('/orderstatusupdate/:orderid',adminauthmiddleware,adminController.orderstatusupdate)
router.get('/editproduct/:productId',adminController.editproduct)
router.post('/editproduct/:productId', upload.array('Image'),adminController.editproductpost)
router.get('/deleteproduct/:productId',adminController.deleteproduct)
router.get('/productunlist/:productId',adminController.productunlist)
router.get('/productlist/:productId',adminController.productlist)
router.get('/coupon',adminauthmiddleware,couponController.coupon)
router.get('/addcoupon',adminauthmiddleware,couponController.addcoupon)
router.post('/addcoupon',couponController.addcouponpost)
router.get('/coupondelete/:productId',couponController.coupondelete)
router.get('/couponedit/:couponid',adminauthmiddleware,couponController.couponedit)
router.post('/couponedit/:couponid',couponController.couponeditpost)
router.get('/usermanagement',adminauthmiddleware,adminController.usermanagement) 
router.get('/downloadExcel',adminController.generateExcelSalesReport) 





module.exports = router