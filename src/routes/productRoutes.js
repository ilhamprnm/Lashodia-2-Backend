const express = require('express');
const { getAllProducts, addProduct, removeproduct } = require('../controllers/productController');
const router = express.Router();

router.get("/allproducts", getAllProducts);
router.post("/addproduct", addProduct);
router.post("/removeproduct", removeproduct);

module.exports = router;