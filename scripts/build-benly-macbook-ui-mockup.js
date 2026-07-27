const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const basePath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-macbook-mockup-base.png';
const screenPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/화면이미지/pc-단어장상세2.png';
const outputPath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-macbook-ui-mockup-8k.png';

const canvas = { width: 7680, height: 4320 };
const display = { left: 2035, top: 842, width: 3650, height: 2255, radius: 16 };

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const base = await sharp(basePath)
    .resize(canvas.width, canvas.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 0.94, brightness: 0.995 })
    .sharpen({ sigma: 0.42, m1: 0.55, m2: 1.45 })
    .png()
    .toBuffer();

  const roundedMask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${display.width}" height="${display.height}">
    <rect width="${display.width}" height="${display.height}" rx="${display.radius}" fill="#fff"/>
  </svg>`);

  const uiScreen = await sharp(screenPath)
    .resize(display.width, display.height, {
      fit: 'cover',
      position: 'centre',
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const glassReflection = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${display.width}" height="${display.height}">
    <defs>
      <linearGradient id="reflection" x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.055"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0.012"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${display.width}" height="${display.height}" rx="${display.radius}" fill="url(#reflection)"/>
  </svg>`);

  await sharp(base)
    .composite([
      { input: uiScreen, left: display.left, top: display.top, blend: 'over' },
      { input: glassReflection, left: display.left, top: display.top, blend: 'over' },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
