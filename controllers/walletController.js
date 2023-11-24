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
    const wallet = await walletModel.findOne({ userId: userid })
    const balance = wallet.balance.toFixed(2)
    // console.log(balance);
    // console.log('wlaeet',wallet);
    res.render('user/wallet', { user, balance })
}


const walletreturnadd = async (req, res) => {
    const totalAmount = parseFloat(req.params.totalAmount)
    const userId = req.session.user._id
    const orderid = req.params.orderid
    console.log('orderid', orderid);

    try {
      
        let wallet = await walletModel.findOne({ userId: userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

      
        wallet.balance += totalAmount
        wallet.transactions.push({ amount: totalAmount, transactionType: 'credit' });

      
        await wallet.save();


        const orderdata = await OrderModel.findOneAndUpdate({ _id: orderid }, { Status: 'Order Returned' })
        orderdata.save()
        console.log('update', orderdata.Status);

        // console.log('wallet updated', wallet); 
        res.json(wallet); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const walletcanceladd = async (req, res) => {
    const totalAmount = parseFloat(req.params.totalAmount)
    const userId = req.session.user._id
    const orderid = req.params.orderid
    console.log('orderid', orderid);

    try {
         
        let wallet = await walletModel.findOne({ userId: userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

      
        wallet.balance += totalAmount
        wallet.transactions.push({ amount: totalAmount, transactionType: 'credit' });

        await wallet.save();


        const orderdata = await OrderModel.findOneAndUpdate({ _id: orderid }, { Status: 'Order Cancelled' })
        orderdata.save()
        console.log('update', orderdata.Status);

        // console.log('wallet updated', wallet); 
        res.json(wallet); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const walletpayment = async (req, res) => {
    console.log('1');
    const amount = req.params.amount;
    console.log('amountskjwallet', amount);
    const userid = req.session.user._id;
    
    try {
        const userwallet = await walletModel.findOne({ userId: userid });

        if (!userwallet) {
            return res.json({ error: "User wallet not found" });
        }

        const balance = userwallet.balance;

        if (amount > userwallet.balance) { 
            return res.json({ error: "Insufficient Balance in wallet" });
        } else {
            
            userwallet.balance = balance - amount;
            await userwallet.save();
            console.log('updated wallet', userwallet);

            return res.json({ success: true, message: "Payment successful" });
        }
    } catch (error) {
        console.error('Error in walletpayment:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};





module.exports = {
    wallet, walletcanceladd, walletreturnadd, walletpayment
}