require('dotenv').config();
const port = process.env.port;
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const multer = require("multer");
const jwt = require("jsonwebtoken")
const path = require("path");
const cors = require("cors");
const mdb_key = process.env.MongoDB_Key;
const { Storage } = require('@google-cloud/storage');
const { format } = require('util');


app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect(mdb_key);

// Create API 
app.get('/', (req,res)=>{
  res.send('Express app is running')
})

// Set up Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, 
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID, 
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

// Set up Multer to use Google Cloud Storage
const upload = multer({storage: multer.memoryStorage()})

// API for Upload Images to Google Cloud Storage
app.post('/upload', upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const blob = bucket.file(`${req.file.fieldname}_${Date.now()}${path.extname(req.file.originalname)}`);
  const blobStream = blob.createWriteStream({
    resumable: false, // You can set this to true for larger files
    contentType: req.file.mimetype,
  });

  blobStream.on('error', (err) => {
    res.status(500).json({ error: 'Unable to upload the image.' });
  });

  blobStream.on('finish', () => {
    // The public URL can be used to access the file via HTTP.
    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

    res.status(200).json({
      success: 1,
      image_url: publicUrl,
    });
  });

  blobStream.end(req.file.buffer); // Send the file buffer to Google Cloud Storage
});



app.listen(port, (error) => {
  if (!error) {
    console.log('Server Runnning on Port '+port);
  } else {
    console.log('Error : '+error)
  }
})

// Schema for User model

const Users = mongoose.model('Users', {
  username: {
    type:String,
    required:true
  },
  email:{
    type:String,
    unique:true,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  cartData:{
    type:Array,
    default:[]
  },
  date:{
    type:Date,
    default:Date.now,
  }
})

// API for user register

app.post('/signup', async (req,res) => {

  let check = await Users.findOne({email:req.body.email});
  if (check) {
    return res.status(400).json({success:false, errors:"Existing user found with same email adress"})
  }
  let cart = [];
  
  const user = new Users({
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
})

// API for Login 

app.post('/login', async (req, res) => {
  let user = await Users.findOne({email:req.body.email});
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
})

// Middleware to fetch user

const fetchUser = async (req,res,next) => {
  const token = req.header('auth-token');

  if(!token) {
    res.status(401).send({errors:'Please authenticate using valid token'})
  } else {
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({errors:"Please authenticate using a valid token"})
    }
  }

}

// API for AddToCart

app.post('/addtocart',fetchUser,async (req,res) => {

  try {

    let userData = await Users.findOne({_id:req.user.id});
  
    if (!userData) {
      return res.status(404).json({success:false, message:"User not found"})
    };

    const productId = req.body.product.id ;
    const quantity = req.body.quantity || 1;

    let productInCart = userData.cartData.find(item => item.productId === productId);

    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      const newProduct = {
        productId:req.body.product.id,
        title:req.body.product.title,
        quantity:quantity,
        price:req.body.product.new_price,
        image:req.body.product.image
      };
    
      userData.cartData.push(newProduct);
    }
  
  
    await userData.save();

    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData})
  
    res.status(200).json({success:true, message:"Product added to cart", cartData:userData.cartData})

  } catch (error) {
    console.log(error)
    res.status(500).json({success:false, message:'Server error'})
  }

})

// API for remove product from cart 

app.post('/removefromcart',fetchUser, async (req,res) => {

  try {
    let userData = await Users.findOne({_id:req.user.id});
  
    const productId = req.body.productId;
    
    const remainingItem = userData.cartData.filter(product => productId != product.productId);

    userData.cartData = remainingItem;
  
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:remainingItem});
  
    await userData.save();
    
  
    res.status(200).json({success:true, message:'Product Removed from cart', cartData:userData.cartData})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false, message:'Server error'})
  }

})


// Schema for creating products 

const Product = mongoose.model('Product', {
  id : {
    type:Number,
    required:true,
  },
  title : {
    type:String,
    required:true,
  }, 
  image : {
    type:String,
    required:true,
  },
  category : {
    type:String,
    required:true
  }, 
  new_price : {
    type:Number,
    required:true
  },
  old_price : {
    type:Number,
    required:true
  },
  date: {
    type:Date,
    default:Date.now
  }, 
  available: {
    type:Boolean,
    default:true
  },
  description: {
    type:String,
    required:true,
  },
  rating : {
    rate :{
      type:Number,
      required:true
    },
    count : {
      type:Number,
      required:true
    }
  }
})

// API for Deleting product

app.post('/removeproduct', async (req,res) => {
  await Product.findOneAndDelete({id:req.body.id})
  console.log("Removed")
  res.json({
    success:true,
    name:req.body.name
  })
})

// API for getting all products

app.get('/allproducts', async (req,res) => {
  let products = await Product.find({});
  console.log('All products fetched');
  res.send(products)
})

// API for getting cartData

app.get('/getcartdata',fetchUser, async (req,res)=>{
  let userCart = await Users.findOne({_id:req.user.id});
  console.log('Cart data fetched')
  res.send(userCart.cartData)
})


// API for Add product

app.post('/addproduct', async (req,res) => {
  let products = await Product.find({});
  let id;
  if (products.length>0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id:id,
    title:req.body.title,
    image:req.body.image,
    category:req.body.category,
    new_price: req.body.new_price,
    old_price:req.body.old_price,
    description:req.body.description,
    rating : {
      rate:req.body.rating.rate,
      count:req.body.rating.count
    }
  })
  await product.save();
  console.log('Saved');
  res.json({
    success:true,
    title:req.body.title
  })
})
