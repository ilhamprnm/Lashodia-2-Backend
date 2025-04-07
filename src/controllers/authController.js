const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Sign Up
const signUp = async (req, res) => {
  try {
    let check = await User.findOne({email:req.body.email});
    if (check) {
      return res.status(400).json({success:false, errors:"Existing user found with same email adress"})
    }
    let cart = [];
    
    const user = new User({
      username:req.body.username,
      email:req.body.email,
      password:req.body.password,
      cartData:cart
    })

    await user.save();

    const data = {
      user:{
        id:user.id
      }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

const signIn = async (req, res) => {
  try {
    let user = await User.findOne({email:req.body.email});
      console.log('test');
      if (user) {
        let checkPassword = req.body.password === user.password;
        if (checkPassword) {
          const data = {
            user: {
              id:user.id
            }
          }
          const token = jwt.sign(data, 'secret_ecom');
          res.json({success:true,token})
        } else {
          res.json({success:false, errors:"Wrong Pasword"})
        }
      } else {
        res.json({success:false, errors:"Wrong Email / There are no user with this email"})
      }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { signUp, signIn }
