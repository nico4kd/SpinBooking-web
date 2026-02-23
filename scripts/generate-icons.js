#!/usr/bin/env node

/**
 * PWA Icon Generator for SpinBooking
 * Generates all required icon sizes from an SVG base using sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SpinBooking SVG logo — cycling wheel with "SB" initials
const svgBase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="#0a0a0f"/>

  <!-- Spinning wheel outer ring -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#06b6d4" stroke-width="16"/>

  <!-- Wheel spokes -->
  <line x1="256" y1="76" x2="256" y2="436" stroke="#06b6d4" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
  <line x1="76" y1="256" x2="436" y2="256" stroke="#06b6d4" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
  <line x1="129" y1="129" x2="383" y2="383" stroke="#06b6d4" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
  <line x1="383" y1="129" x2="129" y2="383" stroke="#06b6d4" stroke-width="8" stroke-linecap="round" opacity="0.5"/>

  <!-- Center hub -->
  <circle cx="256" cy="256" r="36" fill="#06b6d4"/>

  <!-- "SB" text -->
  <text
    x="256"
    y="275"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="40"
    font-weight="800"
    fill="#0a0a0f"
    letter-spacing="-2"
  >SB</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons...');

  const svgBuffer = Buffer.from(svgBase);

  // Generate all standard sizes
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  const applePath = path.join(iconsDir, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(applePath);
  console.log('  ✓ apple-touch-icon.png');

  // Copy SVG as favicon.svg
  const faviconSvgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(faviconSvgPath, svgBase);
  console.log('  ✓ favicon.svg');

  // Generate favicon.ico as 32x32 PNG (browsers accept PNG as ICO)
  const faviconPath = path.join(publicDir, 'favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('  ✓ favicon.ico (32x32 PNG)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
