const couponSchema = require('../model/admin/couponSchema')
const moment = require('moment')

const coupon = async (req, res) => {
    const coupnData = await couponSchema.find()
    console.log('coupnData', coupnData);
    res.render('admin/coupon', { coupnData })
}


const addcoupon = async (req, res) => {

    res.render('admin/addcoupon')
}

const addcouponpost = async (req, res) => {
    try {
        const { name, code, discount, expiryDate } = req.body
        console.log('received', name, code, discount, expiryDate)

        const newCoupon = new couponSchema({
            name, code, discount, expiryDate
        })
        console.log('new coupon', newCoupon);

        await newCoupon.save()
        console.log('coupn saved to database');

        res.redirect('/coupon')
    }
    catch (error) {
        console.error(error);
    }
}


const applycoupon = async (req, res) => {
    let { couponCode, totalprice } = req.body;

    // console.log('code is', couponCode)
    // console.log('total is', totalprice);
    totalprice = totalprice.replace(/₹/g, ''); // remove ₹ 
    totalprice = parseFloat(totalprice); // convert to number
    const coupon = await couponSchema.findOne({ code: couponCode });

    if (!coupon) {
        return res.json({ error: 'Invalid coupon code' });
    }

    const discount = coupon.discount;
    console.log('discount is', discount);
    const discountedPrice = totalprice - (totalprice * (discount / 100));
    console.log('discounted price is', discountedPrice);

    res.json({ message: 'Coupon applied successfully', discountedPrice});
}

module.exports = {
    coupon, addcoupon, addcouponpost, applycoupon
}