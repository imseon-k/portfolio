const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const phonePath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/phone.png';
const pebblePath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/symbol-3d-only.png';
const outputPath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-phone-pebble-mockup-8k.png';

const canvas = { width: 7680, height: 4320 };
const angle = 5.0;
const targetCenter = { x: 3800, y: 1851 };

async function alphaColoredGlow(imageBuffer, color) {
  const metadata = await sharp(imageBuffer).metadata();
  const alpha = await sharp(imageBuffer)
    .extractChannel('alpha')
    .linear(0.32, 0)
    .blur(34)
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 3,
      background: color,
    },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

async function luminousBody(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const alphaRaw = await sharp(imageBuffer)
    .extractChannel('alpha')
    .raw()
    .toBuffer();
  const boostedAlpha = Buffer.alloc(alphaRaw.length);
  for (let i = 0; i < alphaRaw.length; i += 1) {
    const value = alphaRaw[i];
    boostedAlpha[i] = value < 8 ? 0 : Math.min(205, Math.round((value - 8) * 2.6));
  }
  const stops = [
    { at: 0, color: [189, 239, 255] },
    { at: 0.20, color: [75, 169, 255] },
    { at: 0.55, color: [1, 122, 251] },
    { at: 1, color: [23, 215, 208] },
  ];
  const gradientRaw = Buffer.alloc(metadata.width * metadata.height * 3);
  for (let y = 0; y < metadata.height; y += 1) {
    for (let x = 0; x < metadata.width; x += 1) {
      const t = Math.min(1, Math.max(0, (x / metadata.width) * 0.35 + (y / metadata.height) * 0.65));
      let from = stops[0];
      let to = stops[stops.length - 1];
      for (let s = 0; s < stops.length - 1; s += 1) {
        if (t >= stops[s].at && t <= stops[s + 1].at) {
          from = stops[s];
          to = stops[s + 1];
          break;
        }
      }
      const mix = (t - from.at) / Math.max(0.0001, to.at - from.at);
      const pixel = (y * metadata.width + x) * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        gradientRaw[pixel + channel] = Math.round(from.color[channel] * (1 - mix) + to.color[channel] * mix);
      }
    }
  }

  return sharp(gradientRaw, { raw: { width: metadata.width, height: metadata.height, channels: 3 } })
    .joinChannel(boostedAlpha, {
      raw: { width: metadata.width, height: metadata.height, channels: 1 },
    })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const phone = await sharp(phonePath)
    .resize(canvas.width, canvas.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.02, brightness: 0.99 })
    .sharpen({ sigma: 0.45, m1: 0.55, m2: 1.5 })
    .png()
    .toBuffer();

  const pebblePrepared = await sharp(pebblePath)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 5 })
    .resize(740, 610, { fit: 'contain', kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 1.08, saturation: 0.98 })
    .linear(1.05, 2)
    .ensureAlpha()
    .extend({
      top: 70,
      bottom: 70,
      left: 70,
      right: 70,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const glow = await alphaColoredGlow(pebblePrepared, { r: 1, g: 122, b: 251 });
  const pebbleSize = await sharp(pebblePrepared).metadata();
  const placement = {
    left: Math.round(targetCenter.x - pebbleSize.width / 2),
    top: Math.round(targetCenter.y - pebbleSize.height / 2),
  };

  const radialHalo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="860" height="760" viewBox="0 0 860 760">
    <defs><radialGradient id="halo"><stop offset="0" stop-color="#017AFB" stop-opacity="0.20"/><stop offset="0.45" stop-color="#0BB9FF" stop-opacity="0.08"/><stop offset="1" stop-color="#017AFB" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="430" cy="380" rx="410" ry="350" fill="url(#halo)"/>
  </svg>`);

  const glassReflection = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.055"/>
        <stop offset="0.35" stop-color="#FFFFFF" stop-opacity="0.012"/>
        <stop offset="0.64" stop-color="#9FE9FF" stop-opacity="0.026"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="screen">
        <path d="M3160 744L4100 825L4380 3050L3330 2980Z"/>
      </clipPath>
    </defs>
    <g clip-path="url(#screen)">
      <path d="M3000 650L4490 780L4550 1500L3060 1360Z" fill="url(#glass)"/>
    </g>
  </svg>`);

  await sharp(phone)
    .composite([
      {
        input: radialHalo,
        left: Math.round(targetCenter.x - 430),
        top: Math.round(targetCenter.y - 380),
        blend: 'screen',
      },
      {
        input: glow,
        left: placement.left,
        top: placement.top,
        blend: 'screen',
      },
      {
        input: pebblePrepared,
        left: placement.left,
        top: placement.top,
        blend: 'screen',
      },
      { input: glassReflection, left: 0, top: 0, blend: 'screen' },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(JSON.stringify({ outputPath, pebbleSize }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
