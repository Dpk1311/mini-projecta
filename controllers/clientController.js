const nodemailer = require('nodemailer');
const { UserModel } = require('../model/user/userSchema');
const { CategoryModel } = require('../model/admin/categorySchema')
const { productModel } = require('../model/admin/productSchema')
const { addressModel } = require('../model/user/addressSchema')


//  to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const home = async (req, res) => {
    try {

        const user = req.session.user
        const categorycollection = await CategoryModel.find()
        // console.log(categorycollection);
        res.render('user/home', { categorycollection, user });
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
        res.render('user/home', { msg: '' })
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
            return res.redirect('/login');
        } else if (user.password === password) {
            req.session.user = user;
            req.session.useremail = email;
            return res.redirect('/');
        } else {
            req.session.invalid = true;
            req.session.errormsg = "Incorrect Password";
            return res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
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
    const msg = req.query.msg
    res.render('user/forgotpassword', { msg })
}

const forgotpasswordpost = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            const otp = generateOTP();

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'j29589289@gmail.com',
                    pass: 'potl opgm ojjr cbfn',
                },
                tls: {
                    rejectUnauthorized: false,
                },
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

                    // Set OTP expiration time (e.g., 5 minutes)
                    // user.otp = otp;
                    // user.otpExpiration = Date.now() + 5 * 60 * 1000;
                    // await user.save();

                    // Redirect to the OTP verification page
                    res.redirect('/otp');
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



const signup = (req, res) => {
    res.render('user/signup');
};


const signuppost = async (req, res) => {
    try {
        // Get user input from the signup form
        const { name, email, password, phoneNumber } = req.body;
        console.log('Received signup request:', name, email, phoneNumber);

        // Generate an OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Create a new document using the UserModel
        const newUser = new UserModel({
            name,
            email,
            password,
            phoneNumber,
        });

        // Save the new user to the database
        await newUser.save();
        console.log('User saved to database');

        // Send the OTP via email
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


const otp = (req, res) => {
    res.render('user/otp');
};

const otppost = async (req, res) => {
    try {
        const { otp } = req.body
        const user = await UserModel.findOne({ otp })
        if (!user) {
            res.redirect('/otp')
        }

        else if (user) {

            user.otp = null;
            await user.save();


            res.redirect('/');
            user.isOtpVerified = true
            await user.save();

        } else {

            res.redirect('/otp');
        }

    } catch (error) {
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

const addaddress = (req, res) => {
    try {
        if (req.session.user) {
            res.render('user/addaddress')
        }
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
        console.log('user:', user);
        if (user) {
            res.render('user/edituser', { user })
        }
    }
    catch (error) {
        console.error(error);
    }
}

const editpost = async (req, res) => {
    try {
        const userId = req.session.user._id
        console.log('userid', userId);
        const user = await UserModel.findById(userId)
        console.log('user is', user);

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber

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
      if (user) {
        // Filter the user's selected addresses based on the addressIds
        const selectedAddresses = user.selectedAddress.filter((address) =>
          addressIds.includes(address._id.toString())
        );
        res.render('user/editaddress', { user, selectedAddresses });
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
      console.log('user is', user);
  
      const addressId = req.params.addressId;
      console.log('addressid is', addressId);

      // Retrieve the updated address details from the request body
  
      // Find the selected address in the user's address array
      const selectedAddress = user.address.find(address => address._id.toString() === addressId);
  console.log('selectedAddress',selectedAddress);
      // Update the address fields if provided
      if (selectedAddress) {
        selectedAddress.street = req.body. street0 || selectedAddress.street
        selectedAddress.city = req.body.city0 || selectedAddress.city
        selectedAddress.state = req.body.state0 || selectedAddress.state 
        selectedAddress.pincode = req.body.pincode0 || selectedAddress.pincode
        selectedAddress.country = req.body.country0 || selectedAddress.country
  
        await selectedAddress.save();
        console.log(' req.body.street ', req.body );
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
  
      // Update the address field with the new address
      await UserModel.findOneAndUpdate(
        { _id: userId },
        { $push: { address: address } }
      );
  
      // Update the selectedAddress field with the new selected address
      await UserModel.findOneAndUpdate(
        { _id: userId },
        { selectedAddress: address }
      );
  
      // Fetch the updated user data
      const updatedUser = await UserModel.findById(userId);
    //   updatedUser.selectedAddress = address;
    //   await updatedUser.save();

      
  
      // Send the updated user data as the response
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update address' });
    }
  };
  
  

const addaddresspost = async (req, res) => {
    try {
        const usermail = req.session.useremail
        const { street, city, state, pincode, country } = req.body
        const verifymail = await UserModel.findOne({ email: usermail })
        if (!verifymail) {
            res.redirect('/')
        }
        const newAddress = new addressModel({
            street,
            city,
            state,
            pincode,
            country
        })
        await newAddress.save()

        verifymail.address.push(newAddress)
        await verifymail.save()
        console.log('newaddress saved to database');
        res.redirect('/userprofile')

    }
    catch (error) {
        console.error(error);
    }
}

const productpage = async (req, res) => {
    const itemid = req.query.product_Id
    const user = req.session.user
    const productdisplay = await productModel.findById(itemid)
    res.render('user/productpage', { productdisplay, user })
}

const product_shirts = async (req, res) => {
    const productcollection = await productModel.find()
    const user = req.session.user
    console.log('productcollection', productcollection);
    res.render('user/product_shirts', { productcollection, user })
}




module.exports = {
    home,
    login,
    loginpost,
    logout,
    signup,
    signuppost,
    otp,
    product_shirts,
    productpage,
    otppost,
    forgotpassword,
    forgotpasswordpost,
    userprofile,
    addaddress,
    addaddresspost,
    edituser,
    editpost,
    saveaddress,
    updateAddress,
    editaddress,
    editaddresspost,


};
