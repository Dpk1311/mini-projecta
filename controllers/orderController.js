const OrderModel = require('../model/user/orderSchema')
const { UserModel } = require('../model/user/userSchema')
const cartModel = require('../model/user/cartSchema');
const PDFDocument = require('pdfkit')
const fs = require('fs')



const generateInvoiceWithPdfKit = (cartData, data) => {

    //console.log('order.amount', cartData)

    console.log('generateInvoiceWithPdfKit');
    const doc = new PDFDocument();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    const outputFilename = `invoice_${cartData._id}.pdf`;
    const outputFilePath = `./public/invoices/${outputFilename}`;
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    doc.info.Title = `Invoice ${cartData._id}`;
    doc.info.Author = 'V A S T R A';

    // const logoPath = 'public/uploads/VASTRA.png'; 
    // doc.image(logoPath, 100, -30, { width: 350,height : 200 });

    doc.fontSize(20).text('V A S T R A', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`Invoice Number: INV-${cartData._id}`).moveDown(0.5);
    doc.fontSize(12).text(`Invoice Date: ${formattedDate}`).moveDown(0.5);
    doc.fontSize(12).text(`Customer: ${data.user}`).moveDown(1);
    doc.moveDown(10)
    doc.text('Shipping Address is:')
    doc.moveDown()
    doc.text(`${cartData.shippingAddress.street}`)
    doc.text(`${cartData.shippingAddress.city}`)
    doc.text(`${cartData.shippingAddress.state}`)
    doc.text(`${cartData.shippingAddress.pincode}`)
    doc.text(`${cartData.shippingAddress.country}`)


    doc.font('Helvetica-Bold');
    doc.text('Name', 100, 200, { width: 200 });
    doc.text('Image', 250, 200, { width: 200 });
    doc.text('Quantity', 300, 200, { width: 100 });
    doc.text('Unit Price', 370, 200, { width: 100 });
    doc.text('Amount', 450, 200, { width: 100 });

    const productsData = data.products;
    let y = 240;

    doc.font('Helvetica');
    productsData.forEach((product) => {
        doc.text(product.product.Name, 100, y, { width: 200 });
        // doc.image(product.product.Image[1], 250, y, { width: 200 });
        doc.text(product.quantity.toString(), 300, y, { width: 50 });
        doc.text(product.product.Price, 370, y, { width: 100 });
        doc.text((product.quantity * product.product.Price).toFixed(2), 450, y, { width: 100 });
        y += 20;
    });

    doc.moveTo(100, y).lineTo(550, y).stroke();

    const totalAmount = productsData.reduce(
        (total, product) => total + product.quantity * product.price,
        0
    );

    doc.fontSize(14).text(`Total: ${cartData.totalAmount.toFixed(2)}`, 350, y + 10, { width: 100 });
    doc.moveDown(5)

   
    doc.end();

    console.log(`Invoice saved as ${outputFilename}`);
    return outputFilename;
};

const orders = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress');
        console.log('orders', user);
        const cartData = await cartModel.findOne({ user: userid })
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
        console.log('cartdata is', cartData);

        let subtotal = 0
        for (const item of cartData.products) {
            subtotal += item.product.Price * item.quantity
        }


        let discountedPrice = req.query.discountedPrice;
        totalfinal = discountedPrice

        const orderData = {
            user: user._id, // Store user's ID
            products: cartData.products,
            totalAmount: totalfinal,
            shippingAddress: user.selectedAddress[0], // Use the selected address
            paymentMethod: 'Cash on Delivery', // Example payment method
        };

        // console.log('database orderdata',orderData);
        // Create a new order document and save it to the database
        const newOrder = new OrderModel(orderData);
        await newOrder.save();

        // After saving the order, you can clear the user's shopping cart or take any other necessary actions.

        res.redirect('/confirmpage');

    }
    catch (error) {
        console.error(error);
    }
}


const confirmpage = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress')

        const cartData = await OrderModel.findOne({ user: userid })
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
            .sort({ orderDate: -1 })

        console.log('cartData is', cartData);

        let subtotal = 0
        for (const item of cartData.products) {
            subtotal += item.product.Price * item.quantity
        }

        const data = {
            user: user.name, // Include the user's name
            products: cartData.products, // Include the cart products
            selectedAddress: user.selectedAddress,// Include the selected address
            total: cartData.totalAmount

        }

        console.log('data is', data);
        const pdflink = generateInvoiceWithPdfKit(cartData, data)
        console.log('pdflink', pdflink);
        await cartModel.deleteOne({ user:userid })
        res.render('user/confirmpage', { user, data, subtotal, pdflink })
    }
    catch (error) {
        console.error(error);
    }
}


const orderhistory = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('selectedAddress')
        // console.log('user is',user);
        const cartData = await OrderModel.find({ user: userid })
            .populate({
                path: 'products.product', // Use 'path' to specify the nested reference
                model: 'Product' // Replace with your product model name

            })
            .populate({
                path: 'shippingAddress',
                model: 'address', // Replace with your address model name
            });
        cartData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

        // console.log('cartData is', cartData);
        // const order = cartData.sort(1)
        // console.log('sorted');
        // Check if the cancel button is clicked
        // const data = {
        //     user: user.name, // Include the user's name
        //     products: cartData.products,
        // }


        // console.log('orderhistory data', cartData);
        res.render('user/orderhistory', { user, cartData });
    }
    catch (error) {
        console.error(error)
    }
}


const ordercancel = async (req, res) => {
    if (req.params.orderid) {
        const orderid = req.params.orderid;
        console.log('orderId', orderid);
        const order = await OrderModel.findById(orderid);
        // console.log(order)

        // Check if the order status is "Order Pending"
        if (order.Status === 'OrderPending') {
            order.Status = 'Order Cancelled';
            await order.save();
            console.log('order cancelled');
        }
        res.json('order cancelled')
    }
}


const orderdetail = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
        const orderId = req.query.orderId
        const orderData = await OrderModel.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Product', // Replace with your product model name
            })
            .populate({
                path: 'shippingAddress',
                model: 'address', // Replace with your address model name
            })

        // console.log('orderdata is', orderData)
      
        // Combine the user's name with the cart data
        const data = {
            user: user.name, // Include the user's name
            products: orderData.products, // Include the cart products
        }

    

        // console.log('detail data',data)
        const pdflink = generateInvoiceWithPdfKit(orderData, data) 
        res.render('user/orderdetailpage', { user, orderData, pdflink })

    }
    catch (error) {
        console.error(error);
    }
}






module.exports = {
    orders, confirmpage, orderhistory, orderdetail, ordercancel,
}