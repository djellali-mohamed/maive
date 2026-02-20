const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const IMAGE_DIR = path.join(__dirname, '../../frontend/images/products');

async function sync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maive');
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'superadmin' });
    const defaultCategory = await Category.findOne() || await Category.create({ name: 'Collection', description: 'Nouvelle Collection' });

    const files = fs.readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`Found ${files.length} images in ${IMAGE_DIR}`);

    // Get existing product images to avoid duplicates
    const products = await Product.find().select('variants.images.bagImage variants.images.modelImage');
    const existingImages = new Set();
    products.forEach(p => {
      p.variants.forEach(v => {
        existingImages.add(v.images.bagImage.replace('images/products/', ''));
        existingImages.add(v.images.modelImage.replace('images/products/', ''));
      });
    });

    const newFiles = files.filter(f => !existingImages.has(f));
    console.log(`Need to import ${newFiles.length} new images`);

    for (let i = 0; i < newFiles.length; i++) {
       const filename = newFiles[i];
       const name = `Pièce MAIVÉ ${filename.split('.')[0].toUpperCase()}`;
       
       // Create a simple product for each image
       const product = new Product({
         name,
         description: `Une pièce d'exception de notre nouvelle collection. Artisanat de luxe et cuir de premier choix.`,
         shortDescription: `Sac d'exception MAIVÉ`,
         basePrice: 35000 + (Math.floor(Math.random() * 10) * 1000), // Random price around 35k-45k
         currency: 'DZD',
         category: defaultCategory._id,
         material: 'Cuir pleine fleur',
         status: 'active',
         isNewArrival: true,
         variants: [{
           name: 'Default',
           hexCode: '#b8986a',
           images: {
             bagImage: `images/products/${filename}`,
             modelImage: `images/products/${filename}` // Use same for now
           },
           stock: 10,
           sku: `AUTO-${filename.split('.')[0].toUpperCase()}`
         }],
         createdBy: admin._id
       });

       await product.save();
       console.log(`Imported: ${name}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
