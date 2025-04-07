const Product = require("../models/Product")

const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find({});
    console.log('All products fetched');
    res.send(products)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
   
}

const addProduct = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
  
}

const removeproduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed")
    res.json({
      success:true,
      name:req.body.name
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
  
}

module.exports = { getAllProducts, addProduct, removeproduct }