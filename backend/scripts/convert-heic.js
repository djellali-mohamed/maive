/**
 * HEIC to JPG Batch Converter for MAIVÉ Product Images
 * Converts all HEIC files from Telegram Desktop to JPG in frontend/images/products/
 */

const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');

const SOURCE_DIR = path.resolve('C:/Users/ETS BK/Downloads/Telegram Desktop');
const OUTPUT_DIR = path.resolve(__dirname, '../../frontend/images/products');

async function convertAll() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all HEIC and JPG files
  const files = fs.readdirSync(SOURCE_DIR).filter(f => 
    f.toLowerCase().endsWith('.heic') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg')
  );

  console.log(`📸 Found ${files.length} images to process`);

  let converted = 0;
  let copied = 0;
  let errors = 0;

  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    const baseName = path.parse(file).name.toLowerCase().replace(/\s+/g, '-');
    
    try {
      if (file.toLowerCase().endsWith('.heic')) {
        // Convert HEIC to JPG
        const inputBuffer = fs.readFileSync(inputPath);
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.85
        });
        
        const outputPath = path.join(OUTPUT_DIR, `${baseName}.jpg`);
        fs.writeFileSync(outputPath, outputBuffer);
        converted++;
        console.log(`✅ Converted: ${file} → ${baseName}.jpg`);
      } else {
        // Copy JPG/JPEG directly
        const outputPath = path.join(OUTPUT_DIR, `${baseName}.jpg`);
        fs.copyFileSync(inputPath, outputPath);
        copied++;
        console.log(`📋 Copied: ${file} → ${baseName}.jpg`);
      }
    } catch (err) {
      errors++;
      console.error(`❌ Failed: ${file} — ${err.message}`);
    }
  }

  console.log(`\n✨ Done! Converted: ${converted}, Copied: ${copied}, Errors: ${errors}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  
  // List all output files
  const outputFiles = fs.readdirSync(OUTPUT_DIR);
  console.log(`\n📷 ${outputFiles.length} images ready:`);
  outputFiles.forEach(f => console.log(`   ${f}`));
}

convertAll().catch(console.error);
