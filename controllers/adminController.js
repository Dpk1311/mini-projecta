const { Admin } = require('../model/admin/adminSchema')
const { UserModel } = require('../model/user/userSchema')
const { productModel } = require('../model/admin/productSchema')
const { CategoryModel } = require('../model/admin/categorySchema')
const OrderModel = require('../model/user/orderSchema')


const adminlogin = (req, res) => {
    res.render('admin/login')
}

const adminloginpost = async (req, res) => {
    try {
        const check = await Admin.findOne({ fullName: req.body.FullName });
        if (check) {
            if (req.body.password === check.password) {
                res.redirect('/adminhome');
            } else {
                res.send('Invalid Password');
            }
        } else {
            res.send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Wrong details');
    }
}



const adminhome = async (req, res) => {
    try {

        console.log('1');
        const check = await UserModel.find();
        // console.log('check is',check);
        const orderData = await OrderModel.find()
        console.log('product is', orderData);
        res.render('admin/adminhome', { check, orderData })
    }
    catch (error) {
        console.error('error in loading');
    }

}


const usersearch = async (req, res) => {
    const { searchQuery } = req.query;
    console.log(searchQuery);

    try {
        if (!searchQuery) {
            res.redirect('/adminhome');
            return;
        }
        const check = await UserModel.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        console.log(check);
        res.render('admin/adminhome', { check });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const userblock = async (req, res) => {
    const userid = req.params.userId
    console.log('userid block', userid);
    try {
        const check = await UserModel.findById(userid);
        check.block = true
        await check.save()

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

    res.redirect('/adminhome')

}

const userUnblock = async (req, res) => {
    const userid = req.params.userId
    console.log('userid unblock', userid);
    try {
        const check = await UserModel.findById(userid);
        check.block = false
        await check.save()

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

    res.redirect('/adminhome')

}

const productmanagement = async (req, res) => {
    try {
        const check1 = await productModel.find();
        res.render('admin/productmanagement', { check1 })
    }
    catch (error) {
        console.error(error);
    }

}

const addproduct = async (req, res) => {
    try {
        const displaycategory = await CategoryModel.find()
        console.log("displayproduct:", displaycategory);
        res.render('admin/addproduct', { displaycategory })
    }
    catch (error) {
        console.error(error);
    }

}

const addproductpost = async (req, res) => {
    try {
        const { Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity } = req.body;
        console.log('Received signup request:', Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity);

        const imagePaths = req.files.map(file => {
            let imagePath = file.path;

            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }
            return imagePath;
        });
        console.log('image is', imagePaths);

        const newProduct = new productModel({
            Name, Description, Image: imagePaths, Price, Discount, Brand, Category, Size, Quantity
        });
        console.log(newProduct);


        await newProduct.save();
        console.log('product saved to database');
        res.redirect('/productmanagement')
    }
    catch (error) {
        console.error("Internal Server error", error);
    }
}

const editproduct = async (req, res) => {
    const productId = req.params.productId
    // console.log(productId);
    const productData = await productModel.findById(productId)
    // console.log('admin product',productData);
    res.render('admin/editproduct', { productData })
}

const editproductpost = async (req, res) => {
    try {
        const productId = req.params.productId
        // console.log(productId);
        const imagePaths = req.files.map(file => {
            let imagePath = file.path;

            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }
            return imagePath;
        });
        const productData = await productModel.findById(productId)
        // console.log(productData);
        productData.Name = req.body.Name || productData.Name
        productData.Description = req.body.Description || productData.Description
        productData.Price = req.body.Price || productData.Price
        productData.Image = imagePaths || productData.Image
        productData.Discount = req.body.Discount || productData.Discount
        productData.Brand = req.body.Brand || productData.Brand
        productData.Category = req.body.Category || productData.Category
        productData.Size = req.body.Size || productData.Size
        productData.Quantity = req.body.Quantity || productData.Quantity

        await productData.save()
console.log('product updated');
        res.redirect('/productmanagement')
    }
    catch (error) {
        console.error(error);
    }
}

const deleteproduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log(productId);
        const productData = await productModel.findByIdAndDelete(productId);
        if (productData) {
            console.log('Document deleted successfully:', productData);
        } else {
            console.log('Document not found or not deleted');
        }
        res.redirect('/productmanagement');
    } catch (error) {
        console.error(error);
    }
}



const categorymanagement = async (req, res) => {
    const category = await CategoryModel.find();
    res.render('admin/categorymanagement', { category })
}


const addcategory = async (req, res) => {
    const category = await CategoryModel.find();
    res.render('admin/addcategory', { category })
}


const addcategorypost = async (req, res) => {
    try {
        const { Name, Description, gender, image, status } = req.body;
        console.log('Received signup request:', Name, Description, gender, image, status);

        let imagePath = req.file.path;
        if (imagePath.includes('public\\')) {

            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {

            imagePath = imagePath.replace('public/', '');
        }

        const existingCategory = await CategoryModel.findOne({ Name: { $regex: new RegExp(`^${Name}$`, 'i') } });
        if (existingCategory) {
            throw new Error('Category already exists');
        }


        const newCategory = new CategoryModel({
            Name, Description, gender, image: imagePath, status
        });
        console.log(newCategory);


        await newCategory.save();
        console.log('product saved to database');
        res.redirect('/categorymanagement')
    }
    catch (error) {
        console.error("Internal Server error", error);
    }
}


const ordermanagement = async (req, res) => {
    try {
        const order = await OrderModel.find()
            .populate({
                path: 'shippingAddress', // Use 'path' to specify the nested reference
                model: 'address' // Replace with your product model name

            })
            .populate({
                path: 'user',
                model: 'User'
            })
            .populate({
                path: 'products.product',
                model: 'Product'
            })
        // console.log('order admin',order);
        res.render('admin/ordermanagement', { order })
    }
    catch (error) {
        console.error(error);
    }
}

const orderstatusupdate = async (req, res) => {
    try {
        if (req.params.orderid) {
            const orderId = req.params.orderid;
            const order = await OrderModel.findById(orderId);
            const status = req.query.status
            order.Status = status;
            await order.save();
            console.log('order updated');

        }

        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.json({ success: false });
    }
}
module.exports = {
    adminlogin, adminloginpost, adminhome, productmanagement, addproduct, addproductpost, categorymanagement, addcategory, addcategorypost, usersearch,
    userblock, userUnblock, ordermanagement, orderstatusupdate, editproduct, editproductpost, deleteproduct,
}

