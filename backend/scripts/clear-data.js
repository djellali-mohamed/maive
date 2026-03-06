/**
 * Clear Transactional Data Script
 * Deletes all orders and carts without affecting products or categories.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const Cart = require('../models/Cart');

const clearData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maive');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear transactional data
    const orderCount = await Order.countDocuments();
    const cartCount = await Cart.countDocuments();
    
    await Order.deleteMany({});
    await Cart.deleteMany({});
    
    console.log(`🗑️  Successfully deleted ${orderCount} orders and ${cartCount} carts.`);
    console.log('✨ The website is now cleared of test transactions.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ CLEARING FAILED!');
    console.error(error);
    process.exit(1);
  }
};

clearData();
