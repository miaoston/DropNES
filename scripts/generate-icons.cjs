const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '../public/logo.svg');
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  console.log('Generating PNG icons from SVG...');
  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/icon-${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated icon-${size}.png`);
  }
  console.log('Icon generation complete!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});