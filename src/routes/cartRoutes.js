const express = require('express');
const router = express.Router();
const fetchUser = require('../middlewares/authMiddleware');
const { addToCart, removeFromCart, getCartData } = require('../controllers/cartController');

router.post('/addtocart', fetchUser, addToCart);
router.post('/removefromcart', fetchUser, removeFromCart);
router.get('/getcartdata', fetchUser, getCartData);

module.exports = router;
