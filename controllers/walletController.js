const { findOne } = require('../model/user/orderSchema')
const walletModel = require('../model/user/walletSchema')
const OrderModel = require('../model/user/orderSchema')


const wallet = async (req, res) => {

    const userid = req.session.user._id
    const user = await UserModel.findById(userid)
    res.render('user/wallet', { user })
}

 
const walletadd = async (req, res) => {
    const totalAmount = parseFloat(req.params.totalAmount);
    const userId = req.session.user._id;

    try {
        // Find the wallet document for the user
        let wallet = await walletModel.findOne({ userId: userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Update the wallet document by adding the totalAmount to the balance and pushing a new transaction
        wallet.balance += totalAmount;
        wallet.transactions.push({ amount: totalAmount, transactionType: 'credit' });

        // Save the updated wallet document
        await wallet.save();


        const orderdata = await OrderModel.findOneAndUpdate({ user: userId })
        orderdata.Status = 'Order Returned'
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