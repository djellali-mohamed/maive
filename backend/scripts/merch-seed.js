const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Lookbook = require('../models/Lookbook');
const Product = require('../models/Product');
require('dotenv').config();

async function seedMerch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maive');
    console.log('📦 Connected to MongoDB');

    // 1. Default Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        hero: {
          type: 'video',
          url: 'videos/hero-video.mp4',
          title: "L'ESSENCE DE VOTRE RENAISSANCE",
          subtitle: 'Éclat Intemporel, Savoir-faire Algérien'
        },
        announcement: {
          text: 'Livraison gratuite sur toutes les commandes de plus de 50.000 DZD',
          isActive: true
        }
      });
      console.log('✅ Created Default Settings');
    }

    // 2. Default Lookbook
    const lookbookCount = await Lookbook.countDocuments();
    if (lookbookCount === 0) {
      const product = await Product.findOne();
      if (product) {
        await Lookbook.create({
          title: 'Collection Héritage',
          image: 'images/products/img_3549.jpg',
          hotspots: [
            { x: 45, y: 60, product: product._id }
          ]
        });
        console.log('✅ Created Default Lookbook');
      }
    }

    console.log('✨ Merchandising Seed Complete');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedMerch();
