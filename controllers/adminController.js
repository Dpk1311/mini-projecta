const { Admin } = require('../model/admin/adminSchema')
const { UserModel } = require('../model/user/userSchema')
const { productModel } = require('../model/admin/productSchema')
const { CategoryModel } = require('../model/admin/categorySchema')
const OrderModel = require('../model/user/orderSchema')

const PDFDocument = require('pdfkit')
const fs = require('fs')
const ExcelJS = require('exceljs')


const generateInvoiceWithPdfKit = (orders, user) => {
    const doc = new PDFDocument();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    const outputFilename = `sales_report.pdf`;
    const outputFilePath = `./public/salesreportpdf/${outputFilename}`;
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    doc.info.Title = `Sales Report`;
    doc.info.Author = 'V A S T R A';

    let y = 50

    doc.fontSize(20).text('V A S T R A', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`Report Date: ${formattedDate}`).moveDown(0.5);
    doc.fontSize(12).text(`Generated By: ${user.name}`).moveDown(1);



    orders.forEach((order) => {
        if (y + 50 > doc.page.height) {
            doc.addPage()
            y = 50
        }
        doc.font('Helvetica-Bold');
        doc.text(`Order ID: ${order._id}`, 100, y, { width: 200 });
        doc.text('Name', 100, y + 20, { width: 200 });
        doc.text('Quantity', 300, y + 20, { width: 100 });
        doc.text('Unit Price', 350, y + 20, { width: 100 });
        doc.text('Amount', 450, y + 20, { width: 100 });

        y += 20
        const productsData = order.products
        doc.font('Helvetica');
        productsData.forEach((product) => {
            if (y + 20 > doc.page.height) {
                doc.addPage()
                y = 50
            }
            doc.text(product.product.Name, 100, y, { width: 200 });
            doc.text(product.quantity.toString(), 300, y, { width: 50 });
            doc.text(product.product.Price, 350, y, { width: 100 });
            doc.text((product.quantity * product.product.Price).toFixed(2), 450, y, { width: 100 });
            y += 20;
        })

        y += 20;
    })

    doc.end();

    console.log(`Sales report saved as ${outputFilename}`);
    return outputFilename;
}




const generateExcelSalesReport = async (req, res) => {
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const startOfMonth = new Date(fromDate);
        const endOfMonth = new Date(toDate);
        endOfMonth.setHours(23, 59, 59, 999);
        const ordersData = await OrderModel.find({
            orderDate: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        })
            .populate('products.product')
            .populate('shippingAddress')
            .populate('user')
            .exec();
        // console.log(ordersData);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders Data');

        worksheet.columns = [
            { header: 'Customer', key: 'user.name' },
            { header: 'Order ID', key: '_id' },
            { header: 'Product Names', key: 'products.Name' },
            { header: 'Product Quantity', key: 'products.Quantity' },
            { header: 'Address', key: 'shippingAddress.street' },
            { header: 'City', key: 'shippingAddress.city' },
            { header: 'State', key: 'shippingAddress.state' },
            // { header: 'Ordered Pincode', key: 'shippingAddress.pincode' },
            { header: 'Country', key: 'shippingAddress.country' },

            { header: 'Total Amount', key: 'totalAmount' },
        ];

        ordersData.forEach(orderData => {
            const products = orderData.products.map(product => product.product.Name).join(', ');
            const quantity = orderData.products.map(product => product.quantity).join(', ');
            // console.log('evfqvfwqvewrverwvrtv',products);
            worksheet.addRow({
                'user.name': orderData.user.name,
                _id: orderData._id,
                'products.Name': products,
                'products.Quantity': quantity,
                'shippingAddress.street': orderData.shippingAddress.street,
                'shippingAddress.city': orderData.shippingAddress.city,
                'shippingAddress.state': orderData.shippingAddress.state,
                'shippingAddress.postalCode': orderData.shippingAddress.pincode,
                'shippingAddress.country': orderData.shippingAddress.country,

                totalAmount: orderData.totalAmount,
            });
        });


        worksheet.autoFilter = {
            from: { row: 1, column: 8 },
            to: { row: 1, column: 8 }
        };


        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=OrdersData.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Monthly Excel report:', error);
        res.status(500).send('Internal Server Error');
    }
}



const adminlogin = (req, res) => {
    res.render('admin/login')
}

const adminloginpost = async (req, res) => {
    try {
        const check = await Admin.findOne({ fullName: req.body.FullName });
        if (check) {
            if (req.body.password === check.password) {
                req.session.admin = check
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


const adminlogout = async (req, res) => {
    try {
        req.session.admin = null;
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error destroying session');
            } else {
                res.redirect('/adminlogin')
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}



const adminhome = async (req, res) => {
    try {
        let currentDate = new Date();

        // Get the last seven days
        let lastSevenDays = [];
        for (let i = 0; i < 7; i++) {
            let day = new Date();
            day.setDate(currentDate.getDate() - i);
            lastSevenDays.push(day.toISOString().split('T')[0]);
        }

        let monthly = []
        for (let i = 0; i < 31; i++) {
            let day = new Date();
            day.setDate(currentDate.getDate() - i);
            monthly.push(day.toISOString().split('T')[0]);
        }

        // console.log(lastSevenDays);
        const ordersPerDay = await OrderModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" },
                        day: { $dayOfMonth: "$orderDate" },
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day",
                        }
                    },
                    count: 1
                }
            },
            {
                $sort: { date: -1 }
            }
        ]);

        // console.log('ordersPerDay',ordersPerDay);
        const dates = ordersPerDay.map((entry) => entry.date.toISOString().split('T')[0]);
        const alldates = lastSevenDays.concat(dates);
        const orderCounts = [];

        alldates.forEach((element) => {
            orderCounts.push(0); // Initialize counts for all dates to 0
        });

        ordersPerDay.forEach((entry) => {
            const date = entry.date.toISOString().split('T')[0];
            const index = alldates.indexOf(date);
            if (index !== -1) {
                // Update the count at the corresponding index
                orderCounts[index] = entry.count;
            }
        });

        // console.log('orderCounts', orderCounts);

        const totalOrdersandSales = [
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" },
                },
            },
        ];

        const orderStatusCounts = await OrderModel.aggregate([
            {
                $group: {
                    _id: "$Status",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('orderStatusCounts', orderStatusCounts);
        const orderCancelled = orderStatusCounts.find(element => element._id === 'Order Cancelled');
        const orderDelivered = orderStatusCounts.find(element => element._id === 'Order Delivered');
        const orderReturned = orderStatusCounts.find(element => element._id === 'Order Returned');
        const orderShipped = orderStatusCounts.find(element => element._id === 'Order Shipped');
        const orderPending = orderStatusCounts.find(element => element._id === 'OrderPending');
        // console.log('Order Cancelled count:', orderCancelled)


        const user = await UserModel.find()
        const totaluser = user.length

        const order = await OrderModel.find()

        const pdflink = generateInvoiceWithPdfKit(order, user)
        // console.log('totaluser', totaluser)
        const result = await OrderModel.aggregate(totalOrdersandSales)

        if (result.length > 0) {
            const { totalOrders, totalSales, totalUser } = result[0];
            console.log(`Total number of orders: ${totalOrders}`);
            console.log(`Total sales amount: ${totalSales}`);
            res.render('admin/adminhome', { totalOrders, totalSales, lastSevenDays, monthly, orderCounts, totaluser, order, pdflink, orderCancelled, orderDelivered, orderReturned, orderShipped, orderPending });
        } else {
            res.render('admin/adminhome', { totalOrders: 0, totalSales: 0 });
        }
    } catch (error) {
        console.error('Error in loading:', error);
        res.status(500).send('Internal Server Error');
    }
}





const usermanagement = async (req, res) => {
    const check = await UserModel.find();
    // console.log('check is',check);
    res.render('admin/Usermanagement', { check })
}


const usersearch = async (req, res) => {
    const { searchQuery } = req.query;
    console.log(searchQuery);

    try {
        if (!searchQuery) {
            res.redirect('/usermanagement');
            return;
        }
        const check = await UserModel.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        console.log(check);
        res.render('admin/usermanagement', { check });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const userblock = async (req, res) => {
    const userid = req.params.userId
    console.log('userid block', userid);
    try {
        const user = await UserModel.findById(userid);
        user.block = true
        req.session.user = user

        await user.save()

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
        const user = await UserModel.findById(userid);
        user.block = false
        req.session.user = user
        await user.save()

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

    res.redirect('/adminhome')

}

const productmanagement = async (req, res) => {
    try {
        const check1 = await productModel.find().populate('Category')
        console.log('category check', check1);
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
        if (req.session.invalid) {
            req.session.invalid = false
            res.render('admin/addproduct', { displaycategory, message: req.session.errmsg || '' })
        }
        res.render('admin/addproduct', { displaycategory, message: '' })
    }
    catch (error) {
        console.error(error);
    }

}

const addproductpost = async (req, res) => {
    try {
        let { Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity } = req.body;
        // console.log('Received signup request:', Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity);

        Name = Name.trim()
        Description = Description.trim()
        Price = Price.trim()
        Discount = Discount.trim()
        Brand = Brand.trim()
        Category = Category.trim()
        Size = Size.trim()
        Quantity = Quantity.trim()

        if (!Name || !Price || !Discount || !Brand || !Category || !Size || !Quantity) {
            req.session.invalid = true
            req.session.errmsg = 'All Fields are necessary'
            return res.redirect('/addproduct')
        }
        if (Price < 0) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Price'
            return res.redirect('/addproduct')
        }
        if (Name.length > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Name Should be less than 50 Characters'
            return res.redirect('/addproduct')
        }
        if (Discount < 0 || Discount > 99) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Discount'
            return res.redirect('/addproduct')
        }
        if (Quantity < 0 || Quantity > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Quantity'
            return res.redirect('/addproduct')
        }
        if (Size < 0 || Size > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Size'
            return res.redirect('/addproduct')
        }



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
    const displaycategory = await CategoryModel.find()
    console.log(productId);
    const productData = await productModel.findById(productId).populate('Category')
    // console.log('admin product', productData);
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('admin/editproduct', { productData, displaycategory, message: req.session.errmsg || '' })
    } else
        res.render('admin/editproduct', { productData, displaycategory, message: '' })
}

const editproductpost = async (req, res) => {
    try {
        const productId = req.params.productId
        // console.log(productId);

        let { Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity } = req.body;
        console.log('Received signup request:', Name, Description, Image, Price, Discount, Brand, Category, Size, Quantity);
        const productData = await productModel.findById(productId)
        Name = Name.trim()
        Description = Description.trim()
        Price = Price.trim()
        Discount = Discount.trim()
        Brand = Brand.trim()
        Category = Category.trim()
        Size = Size.trim()
        Quantity = Quantity.trim()

        if (!Name || !Price || !Discount || !Brand || !Category || !Size || !Quantity) {
            req.session.invalid = true
            req.session.errmsg = 'All Fields are necessary'
            return res.redirect(`/editproduct/${productId}`)

        }
        if (Price < 0) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Price'
            return res.redirect(`/editproduct/${productId}`)

        }
        if (Name.length > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Name Should be less than 50 Characters'
            return res.redirect(`/editproduct/${productId}`)

        }
        if (Discount < 0 || Discount > 99) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Discount'
            return res.redirect(`/editproduct/${productId}`)

        }
        if (Quantity < 0 || Quantity > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Quantity'
            return res.redirect(`/editproduct/${productId}`)

        }
        if (Size < 0 || Size > 50) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Size'
            return res.redirect(`/editproduct/${productId}`)

        }

        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                let imagePath = file.path;

                if (imagePath.includes('public\\')) {
                    imagePath = imagePath.replace('public\\', '');
                } else if (imagePath.includes('public/')) {
                    imagePath = imagePath.replace('public/', '');
                }
                return imagePath;
            });
        } else {
            imagePaths = productData.Image;
        }


        console.log(productData);
        productData.Name = Name || productData.Name
        productData.Description = Description || productData.Description
        productData.Price = Price || productData.Price
        productData.Image = imagePaths || productData.Image
        productData.Discount = Discount || productData.Discount
        productData.Brand = Brand || productData.Brand
        productData.Category = Category || productData.Category
        productData.Size = Size || productData.Size
        productData.Quantity = Quantity || productData.Quantity

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


const editcategory = async (req, res) => {
    const productId = req.params.productId
    console.log(productId)
    const categoryData = await CategoryModel.findById(productId)
    // console.log('categorydatais', categoryData);
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('admin/editcategory', { categoryData, message: req.session.errmsg || '' })
    }
    res.render('admin/editcategory', { categoryData, message: '' })
}


const editcategorypost = async (req, res) => {
    try {
        const productId = req.params.productId;

        let { Name, Description, image, gender, status } = req.body;

        Name = Name.trim();
        Description = Description.trim();
        gender = gender.trim();
        status = status.trim();
        const categoryData = await CategoryModel.findById(productId);
        if (!Name || !status || !gender || !Description) {
            req.session.invalid = true;
            req.session.errmsg = 'All Fields are necessary';
            return res.redirect(`/editcategory/${productId}`);
        }

        if (Name.length > 15) {
            req.session.invalid = true;
            req.session.errmsg = 'Name Should be less than 15 Characters';
            return res.redirect(`/editproduct/${productId}`);
        }

        // let imagePath = req.file.path;
        // if (imagePath.includes('public\\') || imagePath.includes('public/')) {
        //     imagePath = imagePath.replace('public/', '').replace('public\\', '');
        // }

        let imagePath = req.file ? req.file.path : categoryData.image;

        if (imagePath.includes('public\\')) {
            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {
            imagePath = imagePath.replace('public/', '');
        }

        console.log('imagePath', imagePath);

        categoryData.Name = Name || categoryData.Name;
        categoryData.Description = Description || categoryData.Description;
        categoryData.gender = gender || categoryData.gender;
        categoryData.image = imagePath
        categoryData.status = status || categoryData.status;

        await categoryData.save();
        console.log('category updated');
        res.redirect('/categorymanagement');
    } catch (error) {
        console.error(error);
        // Handle the error and send an appropriate response to the client
        res.status(500).send('Internal Server Error');
    }
};





const addcategory = async (req, res) => {
    const category = await CategoryModel.find();
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('admin/addcategory', { category, message: req.session.errmsg || '' })
    }
    res.render('admin/addcategory', { category, message: '' })
}


const addcategorypost = async (req, res) => {
    try {
        let { Name, Description, gender, status } = req.body;
        console.log('Received signup request:', Name, Description, gender, status)
        const existingCategory = await CategoryModel.findOne({ Name: { $regex: new RegExp(`^${Name}$`, 'i') } });
        Name = Name.trim()
        Description = Description.trim()
        gender = gender.trim()
        status = status.trim()
        if (!Name || !status || !gender || !Description) {
            req.session.invalid = true
            req.session.errmsg = 'All Fields are necessary'
            return res.redirect('/addcategory')
        }
        if (Name.length > 15) {
            req.session.invalid = true
            req.session.errmsg = 'Name Should be less than 15 Characters'
            return res.redirect('/addcategory')

        } if (existingCategory) {
            req.session.invalid = true
            req.session.errmsg = 'Name already exists'
            return res.redirect('/addcategory')
        }





        let imagePath = req.file.path;
        if (imagePath.includes('public\\')) {

            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {

            imagePath = imagePath.replace('public/', '');
        }


        // if (existingCategory) {
        //     throw new Error('Category already exists');
        // }


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

const categorydelete = async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log(productId);
        const categorydata = await CategoryModel.findByIdAndDelete(productId);
        if (categorydata) {
            console.log('Document deleted successfully:', categorydata);
        } else {
            console.log('Document not found or not deleted');
        }
        res.redirect('/categorymanagement');
    }
    catch (error) {
        console.error(error);
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
        order.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        console.log('order admin', order)
        res.render('admin/ordermanagement', { order })
    }
    catch (error) {
        console.error(error);
    }
}


const adminoderdetail = async (req, res) => {

    try {
        const orderId = req.query.orderId
        console.log('orderdetail is', orderId)
        const orderData = await OrderModel.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
            .populate({
                path: 'shippingAddress',
                model: 'address', // Replace with your address model name
            })
        console.log('order admin', orderData);

        res.render('admin/adminorderdetailpage', { orderData })
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


const productunlist = async (req, res) => {
    const productId = req.params.productId
    console.log('productId', productId);
    try {
        const product = await productModel.findById(productId)
        product.Instock = false

        await product.save()
        res.redirect('/productmanagement')
    }
    catch (error) {
        console.error(error);
    }
}

const productlist = async (req, res) => {
    const productId = req.params.productId
    console.log('productId', productId);
    try {
        const product = await productModel.findById(productId)
        product.Instock = true

        await product.save()
        res.redirect('/productmanagement')
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = {
    adminlogin, adminloginpost, adminhome,adminlogout, productmanagement, addproduct, addproductpost, categorymanagement, addcategory, addcategorypost, usersearch,
    userblock, userUnblock, ordermanagement, orderstatusupdate, editproduct, editproductpost, deleteproduct, usermanagement, generateExcelSalesReport,
    productunlist, productlist, editcategory, editcategorypost, categorydelete, adminoderdetail
}

