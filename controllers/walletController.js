const { findOne } = require('../model/user/orderSchema')
const walletModel = require('../model/user/walletSchema')
const OrderModel = require('../model/user/orderSchema')
const { UserModel } = require('../model/user/userSchema')
const { login } = require('./clientController')


const wallet = async (req, res) => {

    const userid = req.session.user._id 
    // console.log('userid',userid);
    const user = await UserModel.findOne({ _id: userid })
    // console.log('user',user); 
    const wallet = await walletModel.findOne({userId: userid })
    const balance = wallet.balance.toFixed(2)
    // console.log(balance);
    // console.log('wlaeet',wallet);
    res.render('user/wallet', { user,balance }) 
}

 
const walletadd = async (req, res) => {
    const totalAmount = parseFloat(req.params.totalAmount) 
    const userId = req.session.user._id
    const orderid = req.params.orderid
    console.log('orderid',orderid); 

    try {
        // Find the wallet document for the user  
        let wallet = await walletModel.findOne({ userId: userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Update the wallet document by adding the totalAmount to the balance and pushing a new transaction
    wallet.balance += totalAmount
        wallet.transactions.push({ amount: totalAmount, transactionType: 'credit' });

        // Save the updated wallet document
        await wallet.save();


        const orderdata = await OrderModel.findOneAndUpdate({ _id: orderid }, { Status: 'Order Returned' })
        orderdata.save()
        console.log('update',orderdata.Status);

        // console.log('wallet updated', wallet); 
        res.json(wallet); // Send the updated wallet document in the response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    wallet, walletadd
}