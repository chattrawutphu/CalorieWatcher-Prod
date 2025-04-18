const { promises: fs } = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define icon sizes
const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'maskable-icon.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-icon-152x152.png', size: 152 },
  { name: 'apple-icon-120x120.png', size: 120 },
];

// Define splash screens for iOS
const splashScreens = [
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 },
  { name: 'apple-splash-1668-2388.png', width: 1668, height: 2388 },
  { name: 'apple-splash-1536-2048.png', width: 1536, height: 2048 },
  { name: 'apple-splash-1125-2436.png', width: 1125, height: 2436 },
  { name: 'apple-splash-1242-2688.png', width: 1242, height: 2688 },
  { name: 'apple-splash-828-1792.png', width: 828, height: 1792 },
  { name: 'apple-splash-1242-2208.png', width: 1242, height: 2208 },
  { name: 'apple-splash-750-1334.png', width: 750, height: 1334 },
  { name: 'apple-splash-640-1136.png', width: 640, height: 1136 },
];

(async () => {
  try {
    // Make sure the icons directory exists
    const iconsDir = path.join(__dirname, 'public', 'icons');
    await fs.mkdir(iconsDir, { recursive: true });

    // Source SVG file
    const svgPath = path.join(iconsDir, 'app-icon-base.svg');
    
    // Generate icons
    for (const icon of icons) {
      console.log(`Generating ${icon.name}...`);
      await sharp(svgPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(iconsDir, icon.name));
    }

    // Generate splash screens
    const logo = await sharp(svgPath)
      .resize(300, 300)
      .toBuffer();

    for (const screen of splashScreens) {
      console.log(`Generating ${screen.name}...`);
      // Create a canvas with the right dimensions and purple background
      const canvas = sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: { r: 147, g: 51, b: 234, alpha: 1 }
        }
      });

      // Overlay the logo in the center
      await canvas
        .composite([
          {
            input: logo,
            gravity: 'center'
          }
        ])
        .png()
        .toFile(path.join(iconsDir, screen.name));
    }

    console.log('All icons and splash screens generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
})(); 