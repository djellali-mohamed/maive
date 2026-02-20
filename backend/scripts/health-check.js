/**
 * MAIVÉ Health Check Diagnostic Script
 * Scans the database for inconsistencies, missing data, and broken relations.
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

async function runAudit() {
  console.log('🔍 Starting MAIVÉ Global Health Audit...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maive');
    console.log('✅ Connected to Database');

    // 1. Audit Categories
    const categories = await Category.find();
    console.log(`\n📂 Auditing ${categories.length} Categories:`);
    let catIssues = 0;
    for (const cat of categories) {
      if (!cat.name) { console.log(`  ❌ Category ${cat._id} is missing a name!`); catIssues++; }
      if (!cat.slug) { console.log(`  ⚠️ Category ${cat.name} is missing a slug.`); catIssues++; }
    }
    if (catIssues === 0) console.log('  ✨ All categories look healthy.');

    // 2. Audit Products
    const products = await Product.find().populate('category');
    console.log(`\n👜 Auditing ${products.length} Products:`);
    let prodIssues = 0;
    for (const prod of products) {
      const issueDetails = [];
      if (!prod.category) issueDetails.push('Missing Category');
      if (!prod.variants || prod.variants.length === 0) issueDetails.push('No Variants');
      
      const hasImages = prod.variants?.some(v => v.images?.bagImage || v.images?.modelImage);
      if (!hasImages) issueDetails.push('Missing Images');

      if (issueDetails.length > 0) {
        console.log(`  ❌ ${prod.name || prod._id}: ${issueDetails.join(', ')}`);
        prodIssues++;
      }
    }
    if (prodIssues === 0) console.log('  ✨ All products have valid data and images.');

    // 3. Audit Orders
    const orders = await Order.find();
    console.log(`\n🛒 Auditing ${orders.length} Orders:`);
    let orderIssues = 0;
    for (const order of orders) {
      if (!order.customer && !order.customerInfo) {
        console.log(`  ❌ Order ${order.orderNumber} is missing customer info!`);
        orderIssues++;
      }
    }
    if (orderIssues === 0) console.log('  ✨ All orders have associated customers.');

    console.log('\n--- Audit Summary ---');
    console.log(`Total Issues Found: ${catIssues + prodIssues + orderIssues}`);
    console.log('----------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Audit Failed:', err);
    process.exit(1);
  }
}

runAudit();
