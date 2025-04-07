const User = require('../models/User');

// Add to cart
const addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { product, quantity = 1 } = req.body;

    const existingProduct = user.cartData.find(item => item.productId === product.id);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      user.cartData.push({
        productId: product.id,
        title: product.title,
        quantity,
        price: product.new_price,
        image: product.image,
      });
    }

    user.markModified("cartData");

    await user.save();
    res.status(200).json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cartData = user.cartData.filter(item => item.productId !== req.body.productId);

    await user.save();
    res.status(200).json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get cart data
const getCartData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addToCart, removeFromCart, getCartData };
