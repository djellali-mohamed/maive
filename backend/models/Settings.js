const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Hero Media
  hero: {
    type: { type: String, enum: ['video', 'image'], default: 'video' },
    url: { type: String, default: 'https://video.wixstatic.com/video/50537f_93c52e50664b49cb86ec621d17d1e8db/1080p/mp4/file.mp4' },
    title: { type: String, default: 'MAIVÉ — L’Atelier' },
    subtitle: { type: String, default: 'Éclat Intemporel, Savoir-faire Algérien' }
  },
  
  // Announcement Bar
  announcement: {
    text: { type: String, default: 'Livraison gratuite sur toutes les commandes de plus de 50.000 DZD' },
    isActive: { type: Boolean, default: true }
  },

  // Featured Content
  featuredCollectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
  // Timestamps
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
