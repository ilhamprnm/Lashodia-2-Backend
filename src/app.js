require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes")

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Routes
app.use('/api/cart', cartRoutes);
app.use("/api/upload", uploadRoutes); 
app.use("/api/auth", authRoutes); 
app.use("/api/product", productRoutes); 

module.exports = app;
