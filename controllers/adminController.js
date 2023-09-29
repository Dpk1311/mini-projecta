const { Admin } = require('../model/admin/adminSchema')
const { UserModel } = require('../model/user/userSchema')
const { productModel } = require('../model/admin/productSchema')
const { CategoryModel } = require('../model/admin/categorySchema')

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
        res.render('admin/adminhome', { check })
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

        let imagePath = req.file.path;

        if (imagePath.includes('public\\')) {

            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {

            imagePath = imagePath.replace('public/', '');
        }


        const newProduct = new productModel({
            Name, Description, Image: imagePath, Price, Discount, Brand, Category, Size, Quantity
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



const categorymanagement = async (req, res) => {
    const category = await CategoryModel.find();
    res.render('admin/categorymanagement', { category })
}


const addcategory = (req, res) => {
    res.render('admin/addcategory')
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
module.exports = {
    adminlogin, adminloginpost, adminhome, productmanagement, addproduct, addproductpost, categorymanagement, addcategory, addcategorypost, usersearch,
    userblock, userUnblock
}

