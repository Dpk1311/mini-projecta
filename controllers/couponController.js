const couponSchema = require('../model/admin/couponSchema')
const moment = require('moment')

const coupon = async (req, res) => {
    const coupnData = await couponSchema.find()
    console.log('coupnData', coupnData);
    res.render('admin/coupon', { coupnData })
}


const addcoupon = async (req, res) => {
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('admin/addcoupon', { message: req.session.errmsg })
    }

    res.render('admin/addcoupon', { message: '' })
}

const addcouponpost = async (req, res) => {
    try {
        let { name, code, discount, expiryDate } = req.body
        console.log('received', name, code, discount, expiryDate)

        name = name.trim()
        discount = discount.trim()
        code = code.trim()

        if (!name || !discount || !code || !expiryDate) {
            req.session.invalid = true
            req.session.errmsg = 'All fields are necessary'
            return res.redirect('/addcoupon')
        }
        if (discount < 0 || discount > 99) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Discount'
            return res.redirect('/addcoupon')
        }
        if (code.length < 5) {
            req.session.invalid = true
            req.session.errmsg = 'Min Code lenth is 5'
            return res.redirect('/addcoupon')
        }
        if (name.length > 10) {
            req.session.invalid = true
            req.session.errmsg = 'Max Name lenth is 10'
            return res.redirect('/addcoupon')
        }
        let expiryDateObj = new Date(expiryDate);

        if (!(expiryDateObj instanceof Date && !isNaN(expiryDateObj.valueOf()))) {
            req.session.invalid = true;
            req.session.errmsg = 'Invalid Expiry Date';
            return res.redirect('/addcoupon');
        }

        if (expiryDateObj < new Date()) {
            req.session.invalid = true;
            req.session.errmsg = 'Expiry Date cannot be in the past';
            return res.redirect('/addcoupon');
        }



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
    console.log('coupon', coupon)

    const expiryDate = coupon.expiryDate
    const currentdate = new Date();
    const isoString = currentdate.toISOString();
    console.log(isoString);

    if (expiryDate < currentdate) {
        return res.json({ error: "Coupon has expired" })
    }


    if (!coupon) {
        return res.json({ error: 'Invalid coupon code' });
    }

    const discount = coupon.discount;
    console.log('discount is', discount);
    const discountedPrice = totalprice - (totalprice * (discount / 100));
    console.log('discounted price is', discountedPrice);

    res.json({ message: 'Coupon applied successfully', discountedPrice });
}


const coupondelete = async (req, res) => {
    try {
        productId = req.params.productId
        console.log(productId);
        const coupondata = await couponSchema.findByIdAndDelete(productId)
        if (coupondata) {
            console.log('Document deleted successfully:', coupondata);
        } else {
            console.log('Document not found or not deleted');
        }

        res.redirect('/coupon')
    }
    catch (error) {
        console.error(error);
    }
}

const couponedit = async (req, res) => {
    try {
        const couponid = req.params.couponid
        console.log(couponid);
        const coupondata = await couponSchema.findById(couponid)
        // console.log(coupondata);
        if (req.session.invalid) {
            req.session.invalid = false
            res.render('admin/editcoupon', { coupondata, message: req.session.errmsg || '' })
        }
        res.render('admin/editcoupon', { coupondata, message: '' })
    }
    catch (error) {
        console.error(error)
    }
}

const couponeditpost = async (req, res) => {
    try {
        const couponid = req.params.couponid
        let { name, code, discount, expiryDate } = req.body
        const coupondata = await couponSchema.findById(couponid)
        name = name.trim()
        code = code.trim()
        discount = discount.trim()

        if (!name || !code || !discount || !expiryDate) {
            req.session.invalid = true
            req.session.errmsg = 'All fields are necessary'
            return res.redirect(`/couponedit/${couponid}`)
        } if (discount < 0 || discount > 99) {
            req.session.invalid = true
            req.session.errmsg = 'Invalid Discount'
            return res.redirect(`/couponedit/${couponid}`)
        }
        if (code.length < 5) {
            req.session.invalid = true
            req.session.errmsg = 'Min Code lenth is 5'
            return res.redirect(`/couponedit/${couponid}`)
        }
        if (name.lenght > 10) {
            req.session.invalid = true
            req.session.errmsg = 'Max Name lenth is 10'
            return res.redirect(`/couponedit/${couponid}`)
        }
        let expiryDateObj = new Date(expiryDate);

        if (!(expiryDateObj instanceof Date && !isNaN(expiryDateObj.valueOf()))) {
            req.session.invalid = true;
            req.session.errmsg = 'Invalid Expiry Date';
            return res.redirect(`/couponedit/${couponid}`);
        }

        if (expiryDateObj < new Date()) {
            req.session.invalid = true;
            req.session.errmsg = 'Expiry Date cannot be in the past';
            return res.redirect(`/couponedit/${couponid}`);
        }

        coupondata.name = name
        coupondata.code = code
        coupondata.discount = discount
        coupondata.expiryDate = expiryDate

        await coupondata.save()
        console.log('coupon updated');
        res.redirect('/coupon')
    }
    catch (error) {
        console.error(error)
    }
}

module.exports = {
    coupon, addcoupon, addcouponpost, applycoupon, coupondelete, couponedit, couponeditpost
}