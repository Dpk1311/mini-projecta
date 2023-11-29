const nodemailer = require('nodemailer');
const { UserModel } = require('../model/user/userSchema');
const { CategoryModel } = require('../model/admin/categorySchema')
const { productModel } = require('../model/admin/productSchema')
const { addressModel } = require('../model/user/addressSchema')
const bcrypt = require('bcrypt')
const walletModel = require('../model/user/walletSchema');
const OrderModel = require('../model/user/orderSchema');
const cartModel = require('../model/user/cartSchema')

//  to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}


const sendemail = process.env.OTP_EMAIL
const sendemailpass = process.env.OTP_EMAIL_PASS

const home = async (req, res) => {
    try {

        const user = req.session.user
        // console.log('user home',user);
        if (user) {
            const userId = req.session.user._id
            const categorycollection = await CategoryModel.find()
            // console.log(categorycollection);

            const Wallet = await walletModel.findOne({ userId: userId })

            if (!Wallet) {
                const newwallet = new walletModel({ userId: userId, balance: 0 })
                await newwallet.save()
            }
            console.log('new wallet created');
            let userCart = await cartModel.findOne({ user: userId });
            // console.log('userCartis:', userCart);

            if (!userCart) {
                // Create a new cart for the user if it doesn't exist
                userCart = new cartModel({
                    user: userId,
                    products: [],
                });
                await userCart.save()
            }

            res.render('user/home', { categorycollection, user });
        }
        else {
            const categorycollection = await CategoryModel.find()
            const user = req.session.invalid
            res.render('user/home', { categorycollection, user })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const login = (req, res) => {
    if (req.session.invalid) {
        req.session.invalid = false
        return res.render('user/login', { msg: req.session.errormsg || '' })
    } else if (req.session.user) {
        res.redirect('/')
    }
    else {
        res.render('user/login', { msg: '' })
    }
}

const loginpost = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            req.session.invalid = true;
            req.session.errormsg = "Incorrect Email";
            return res.redirect('/login');
        } else if (user.block) {
            req.session.invalid = true;
            req.session.errormsg = "User is Blocked";
            return res.redirect('/login')
        } else if (user.isOtpVerified === false) {
            req.session.invalid = true;
            req.session.errormsg = "Invalid User";
            return res.redirect('/login')
        } else {
            // Compare hashed passwords
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.user = user;
                req.session.useremail = email;
                return res.redirect('/');
            } else {
                req.session.invalid = true;
                req.session.errormsg = "Incorrect Password";
                return res.redirect('/login');
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        req.session.invalid = true;
        req.session.errormsg = "Internal Server Error";
        return res.redirect('/login');
    }
};



const logout = (req, res) => {
    req.session.user = null;
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            res.redirect('/login');
        }
    });
};

const forgotpassword = (req, res) => {
    // const msg = req.query.msg
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('user/forgotpassword', { msg: req.session.errmsg || '' })
    }
    res.render('user/forgotpassword', { msg: '' })
}



const forgotpasswordpost = async (req, res) => {
    try {
        let { email } = req.body;
        const user = await UserModel.findOne({ email })



        if (!user) {
            req.session.invalid = true
            req.session.errmsg = "Invalid Email"
            return res.redirect('/forgotpassword')
        }

        if (user) {
            const otp = generateOTP();

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: sendemail,
                    pass: sendemailpass,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: sendemail,
                to: email,
                subject: 'OTP Verification',
                text: `Your OTP for verification is: ${otp}`,
            };

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Error sending OTP via email');
                } else {
                    console.log('Email sent: ' + info.response);

                    // Set OTP expiration time (e.g., 5 minutes)
                    // user.otp = otp;
                    // user.otpExpiration = Date.now() + 5 * 60 * 1000;
                    // await user.save();

                    // Redirect to the OTP verification page
                    user.otp = otp
                    await user.save()
                    req.session.email = user.email
                    res.redirect('/fotp');
                }
            });
        } else {
            // Email does not exist in the database
            res.redirect('/forgotpassword?msg=Invalid Valid Mail');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const updatepassword = async (req, res) => {
    // let oldpassword = req.params.oldpassword
    // let newpassword = req.params.newpassword
    const { oldpassword, newpassword } = req.body
    // oldpassword = oldpassword.trim();
    // newpassword = newpassword.trim();
    if (oldpassword.trim() === '' || newpassword.trim() === '') {
        console.log('All Fields are necessary');
        return res.json({ status: 401, message: 'All Fields are necessary' });
    }
    const userid = req.session.user._id;
    const user = await UserModel.findOne({ _id: userid })

    const passwordMatch = await bcrypt.compare(oldpassword, user.password);
    // if (!oldpassword || !newpassword) {

    // }
    if (!passwordMatch) {
        return res.json({ status: 404, message: 'Old password does not match' });
    }

    if (newpassword.length < 7) {
        return res.json({ status: 401, message: 'Password too short' });
    } else {
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedPassword;
        await user.save();
        req.session.destroy();
        return res.json({ status: 200, message: 'Password updated successfully' });
    }
};




const signup = (req, res) => {
    if (req.session.issue) {
        req.session.issue = false
        return res.status(400).render('user/signup', { message: req.session.errmsg || "" });
    } else {
        res.render('user/signup', { message: "" });
    }


};
function validateEmail(email) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
}




const signuppost = async (req, res) => {
    try {
        // Get user input from the signup form
        let { name, email, password, confirm_password, phoneNumber } = req.body;
        console.log('Received signup request:', name, email, phoneNumber);
        name = name.trim();
        email = email.trim();
        password = password.trim();
        confirm_password = confirm_password.trim()
        phoneNumber = phoneNumber.trim();

        if (!name || !email || !password || !phoneNumber) {
            req.session.issue = true
            req.session.errmsg = "All Fields are necessary"
            return res.redirect('/signup');

        }
        let uemail = await UserModel.findOne({ email: email })
        console.log("uemail", uemail);
        if (uemail && email === uemail.email) {
            req.session.issue = true
            req.session.errmsg = "Use another Email"
            return res.redirect('/signup')
        }
        if (password.length < 7) {
            req.session.issue = true
            req.session.errmsg = "Password must be 8 letters"
            return res.redirect('/signup');
        }
        if (!validateEmail(email)) {
            req.session.issue = true;
            req.session.errmsg = "Invalid email address";
            return res.redirect('/signup');
        }
        if (password !== confirm_password) {
            req.session.issue = true;
            req.session.errmsg = "passwords don't match";
            return res.redirect('/signup');
        }
        if (phoneNumber.length < 10 || phoneNumber.length > 10) {
            req.session.issue = true;
            req.session.errmsg = "Enter a valid number";
            return res.redirect('/signup')
        }



        // Generate an OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp)


        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10); // Adjust the number of rounds as needed

        // Create a new document using the UserModel
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
        });

        // Save the new user to the database
        await newUser.save();
        req.session.newuser = newUser
        console.log('User saved to database');

        // Send the OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: sendemail,
                pass: sendemailpass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: sendemail,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error sending OTP via email');
            } else {
                console.log('Email sent: ' + info.response);

                // Set OTP expiration time (5 minutes)
                newUser.otp = otp;
                newUser.otpExpiration = Date.now() + 5 * 60 * 1000;
                await newUser.save();

                // Redirect to the OTP verification page
                res.redirect('/otp');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const otp = async (req, res) => {
    if (req.session.invalid) {
        req.session.invalid = false
        res.render('user/otp', { message: req.session.errmsg || '' });
    } else {
        res.render('user/otp', { message: '' })
    }

};

const otppost = async (req, res) => {
    try {
        let { otp } = req.body;
        const user = await UserModel.findOne({ otp: otp });

        if (!user) {
            req.session.invalid = true;
            req.session.errmsg = "Invalid OTP";
            return res.redirect('/otp');
        }

        user.otp = null;
        user.isOtpVerified = true;
        await user.save()


        res.redirect('/login')
    } catch (error) {
        console.error(error);
    }
}

const otpresend = async (req, res) => {
    const usern = req.session.newuser
    const email = usern.email
    const user = await UserModel.findOne({ email: email })
    console.log('user iss', user);
    if (user) {
        const otp = generateOTP()
        console.log('Generated OTP:', otp)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'j29589289@gmail.com',
                pass: 'potl opgm ojjr cbfn',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'j29589289@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error sending OTP via email');
            } else {
                console.log('Email sent: ' + info.response);

                // Set OTP expiration time (5 minutes)
                user.otp = otp;
                user.otpExpiration = Date.now() + 5 * 60 * 1000;
                await user.save();

                // Redirect to the OTP verification page
                res.redirect('/otp');
            }
        });

    }


}

const fotp = async (req, res) => {
    try {
        if (req.session.invalid) {
            req.session.invalid = false
            res.render('user/fotp', { message: req.session.errmsg || '' });
        } else {
            res.render('user/fotp', { message: '' })
        }
    }
    catch (error) {
        console.error(error);
    }
}

const fotppost = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await UserModel.findOne({ otp: otp });

        if (!user) {
            req.session.invalid = true;
            req.session.errmsg = "Invalid OTP";
            return res.redirect('/fotp');
        }

        user.otp = null;
        user.isOtpVerified = true;
        await user.save()

        console.log('here is it ');
        res.redirect('/newpassword')
    }
    catch (error) {
        console.error(error);
    }
}


const newpassword = async (req, res) => {
    try {
        res.render('user/newpassword')
    }
    catch (error) {
        console.error(error);
    }
}

const newpasswordpost = async (req, res) => {
    try {
        let { password } = req.body
        password = password.trim()
        email = req.session.email
        console.log('emial is ', email)
        const user = await UserModel.findOne({ email })

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        await user.save()
        console.log('new password saved');
        // console.log(password);
        res.redirect('/login')
    }
    catch (error) {
        console.error(error);
    }
}


const userprofile = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('address')



        if (user) {
            res.render('user/userprofile', { user })
        }
    }
    catch (error) {
        console.error(error);
    }
}

const saveaddress = async (req, res) => {
    try {
        const userid = req.session.user._id
        const user = await UserModel.findById(userid)
            .populate('address')
        const selectedAddressIndex = req.body.address;
        // Retrieve the selected address based on the index
        user.selectedAddress = user.address[selectedAddressIndex]
        await user.save()
        console.log('new address saved');

        // Use selectedAddress for saving logic

        console.log('Selected address index:', selectedAddressIndex);
        res.redirect('/userprofile')
    }
    catch (error) {
        console.error(error);
    }
}



const edituser = async (req, res) => {
    try {
        const userId = req.session.user._id
        const user = await UserModel.findById(userId)
        // console.log('user:', user);
        if (req.session.invalid) {
            req.session.invalid = false
            res.render('user/edituser', { message: req.session.errmsg || "", user })
        }
        if (user) {
            res.render('user/edituser', { user, message: "" })
        }
    }
    catch (error) {
        console.error(error);
    }
}

const editpost = async (req, res) => {
    try {
        const userId = req.session.user._id
        // console.log('userid', userId);
        let { name, email, phoneNumber } = req.body
        const user = await UserModel.findById(userId)
        // console.log('user is', user);

        name = name.trim()
        phoneNumber = phoneNumber.trim()
        email = email.trim()

        if (!name || !phoneNumber || !email) {
            req.session.invalid = true
            req.session.errmsg = "Enter all Fields"
            return res.redirect('/edituser')
        }
        if (!validateEmail(email)) {
            req.session.invalid = true
            req.session.errmsg = "Enter a valid Email"
            return res.redirect('/edituser')
        }
        if (phoneNumber.length !== 10) {
            req.session.invalid = true
            req.session.errmsg = "Enter a valid Number"
            return res.redirect('/edituser')
        }
        if (name.length > 15) {
            req.session.invalid = true
            req.session.errmsg = "Name is too Long"
            return res.redirect('/edituser')
        }

        user.name = name
        user.email = email
        user.phoneNumber = phoneNumber

        await user.save()
        const user1 = req.session.user
        console.log('user1', user1);
        console.log('changes saved in database');
        res.redirect('/userprofile')
    }
    catch (error) {
        console.error(error);
    }
}

const editaddress = async (req, res) => {
    try {
        const addressIds = req.query.addressId; // Get the array of addressIds from the query parameters
        const userId = req.session.user._id;
        const user = await UserModel.findById(userId).populate('selectedAddress');
        console.log('user:', user);
        const selectedAddresses = user.selectedAddress
        console.log('selectedAddresses', selectedAddresses);
        if (req.session.invalid) {
            req.session.invalid = false
            res.render('user/editaddress', { user, selectedAddresses, message: req.session.errmsg || '' })
        }
        if (user) {
            // Filter the user's selected addresses based on the addressIds
            res.render('user/editaddress', { user, selectedAddresses, message: '' })
        }
    } catch (error) {
        console.error(error);
    }
};

const editaddresspost = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log('userid', userId);
        const user = await UserModel.findById(userId).populate('address');
        // console.log('user is', user);

        const addressId = req.params.addressId;
        console.log('addressid is', addressId);

        // Retrieve the updated address details from the request body

        // Find the selected address in the user's address array
        const selectedAddress = user.address.find(address => address._id.toString() === addressId);
        console.log('selectedAddress', selectedAddress);

        let { street, city, state, pincode, country } = req.body
        // console.log('items received',street, city, state, pincode, country);

        street = street.trim()
        city = city.trim()
        state = state.trim()
        pincode = pincode.trim()
        country = country.trim()

        if (!street || !city || !state || !pincode || !country) {
            req.session.invalid = true
            req.session.errmsg = "Enter all the Fields"
            return res.redirect('/editaddress/:addressId')
        }


        // Update the address fields if provided
        if (selectedAddress) {
            selectedAddress.street = street || selectedAddress.street
            selectedAddress.city = city || selectedAddress.city
            selectedAddress.state = state || selectedAddress.state
            selectedAddress.pincode = pincode || selectedAddress.pincode
            selectedAddress.country = country || selectedAddress.country

            await selectedAddress.save();
            console.log(' req.body.street ', req.body);
        } else {
            console.log('Selected address not found');
        }

        res.redirect('/userprofile');
    } catch (error) {
        console.error(error);
    }
};







const updateAddress = async (req, res) => {
    try {
        const { address } = req.body;
        const userId = req.session.user._id;
        const addressParts = address.split(', ');

        const street = addressParts[0];
        const city = addressParts[1];
        const state = addressParts[2];
        const pincode = addressParts[3];
        const country = addressParts[4];


        const newAddress = new addressModel({
            street: street,
            city: city,
            state: state,
            pincode: pincode,
            country: country
        });

        await newAddress.save();

        const newuser = await UserModel.findOneAndUpdate(
            { _id: userId },
            { $set: { selectedAddress: newAddress._id } }
        );
        //    console.log('address chnaged user',newuser);

        let data = 'sucess'
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update address' });
    }
};


const addaddress = (req, res) => {
    try {
        if (req.session.invalid) {
            req.session.invalid = false;
            res.render('user/addaddress', { message: req.session.errmsg || '' });
        } else if (req.session.user) {
            res.render('user/addaddress', { message: '' });
        } else {
            res.redirect('/userprofile');
        }
    } catch (error) {
        console.error(error);
    }
}


const addaddresspost = async (req, res) => {
    try {
        const usermail = req.session.useremail;
        const user = await UserModel.findOne({ email: usermail }).populate('address');
        console.log(user);

        let { street, city, state, pincode, country } = req.body;
        street = street.trim();
        city = city.trim();
        pincode = pincode.trim();
        country = country.trim();

        if (!street || !city || !pincode || !country) {
            req.session.invalid = true;
            req.session.errmsg = "All Fields are necessary";
            return res.redirect('/addaddress');
        }

        const newAddress = new addressModel({
            street,
            city,
            state,
            pincode,
            country
        });
        await newAddress.save();

        user.address.push(newAddress);
        await user.save();
        console.log('newaddress saved to database');
        res.redirect('/userprofile');

    } catch (error) {
        console.error(error);
    }
}


const addaddresscheck = (req, res) => {
    try {
        if (req.session.invalid) {
            req.session.invalid = false;
            res.render('user/addaddresscheck', { message: req.session.errmsg || '' });
        } else if (req.session.user) {
            res.render('user/addaddresscheck', { message: '' });
        } else {
            res.redirect('/checkout')
        }
    } catch (error) {
        console.error(error);
    }
}


const addaddresscheckpost = async (req, res) => {
    try {
        const usermail = req.session.useremail;
        const user = await UserModel.findOne({ email: usermail }).populate('address');
        console.log(user);

        let { street, city, state, pincode, country } = req.body;
        street = street.trim();
        city = city.trim();
        pincode = pincode.trim();
        country = country.trim();

        if (!street || !city || !pincode || !country) {
            req.session.invalid = true;
            req.session.errmsg = "All Fields are necessary";
            return res.redirect('/addaddresscheck');
        }

        const newAddress = new addressModel({
            street,
            city,
            state,
            pincode,
            country
        });
        await newAddress.save();

        user.address.push(newAddress);
        await user.save();
        console.log('newaddress saved to database');
        res.redirect('/checkout');

    } catch (error) {
        console.error(error);
    }
}





const deleteaddress = async (req, res) => {
    const addressid = req.params.addressid
    const userid = req.session.user._id
    console.log(userid);

    const user = await UserModel.findOneAndUpdate(
        { _id: userid },
        { $pull: { address: addressid } },
        { new: true }
    )
    // console.log('user', user);
    // console.log('addressid', addressid); 
    res.redirect('/userprofile')
}

const productpage = async (req, res) => {
    const itemid = req.query.product_Id
    const user = req.session.user
    const productdisplay = await productModel.findById(itemid)
    res.render('user/productpage', { productdisplay, user })
}

const product_shirts = async (req, res) => {
    const user = req.session.user
    const categoryid = req.params.categoryid
    const page = req.query.page || 1
    // console.log(page);
    const limit = 6; // Number of items per page
    const skip = (Number(page) - 1) * limit; // Calculate the number of items to skip   

    const productcollection = await productModel.find({ Category: categoryid }).skip(skip).limit(limit);
    const totalItems = await productModel.countDocuments({ Category: categoryid.toString() });
    // console.log(totalItems);
    const totalPages = Math.ceil(totalItems / limit);

    res.render('user/product_shirts', { productcollection, totalPages, page, user })
}


const allproducts = async (req, res) => {
    const categorycollection = await CategoryModel.find()
    const user = req.session.user
    const page = req.query.page || 1
    // console.log(page);
    const limit = 9; // Number of items per page
    const skip = (Number(page) - 1) * limit; // Calculate the number of items to skip   
    const productcollection = await productModel.find().skip(skip).limit(limit)
    const totalItems = await productModel.countDocuments()
    // console.log('totalitems are',totalItems);
    const totalPages = Math.ceil(totalItems / limit);

    res.render('user/allproducts', {productcollection, totalPages, page, user, categorycollection })
}

const categorysort = async (req,res) =>{
    const categoryid = req.params.categoryid
    console.log('category id is',categoryid);
    const categorycollection = await productModel.find({Category: categoryid});
    console.log('category is',categorycollection);
    res.json(categorycollection)
}







const productsort = async (req, res) => {
    let sortBy = req.query.sort;
    console.log('sortby', sortBy);
    let order = 1; // Default order
 
    if (sortBy === 'High_to_Low') {
        sortBy = 'Price';
        order = -1; // If sorting by price, sort in descending order
    } else if (sortBy === 'Low_to_High') {
        sortBy = 'Price';
        order = 1
    }
 
    productModel.find().sort({ [sortBy]: order })
        .then(products => {
            // Now, 'products' is sorted correctly
            res.json(products);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error occurred while fetching products');
        });
 }
 

const productdiscount = async (req, res) => {
    try {
        const discount = req.params.discount 
        console.log('discount is', discount);
        let products;
        if (discount === '5') {
            products = await productModel.find({ Discount: { $gt: 5 } });
        } else if (discount === '15') {
            products = await productModel.find({ Discount: { $gt: 15 } });
        } else if (discount === '20') {
            products = await productModel.find({ Discount: { $gt: 20 } })
        }
        else {
            products = await productModel.find();
        }
        res.json(products);
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    home,
    login,
    loginpost,
    logout,
    signup,
    signuppost,
    otp,
    fotp,
    product_shirts,
    productpage,
    otppost,
    otpresend,
    forgotpassword,
    forgotpasswordpost,
    updatepassword,
    userprofile,
    addaddress,
    addaddresspost,
    addaddresscheckpost,
    addaddresscheck,
    edituser,
    editpost,
    saveaddress,
    updateAddress,
    editaddress,
    editaddresspost,
    productsort,
    deleteaddress,
    fotppost,
    newpassword,
    newpasswordpost,
    productdiscount,
    allproducts,
    categorysort


};
