const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const basePath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-name-card-mockup-base.png';
const logoPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputPath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-name-card-mockup-spot-uv-8k.png';

const canvas = { width: 7680, height: 4320 };
const card = { left: 3398, top: 714, width: 1068, height: 1808 };

function exactLogoSvg(fill) {
  const source = fs.readFileSync(logoPath, 'utf8');
  const tags = source.match(/<path\b[^>]*>/g) || [];
  const paths = tags.map((tag) => {
    const d = (tag.match(/d="([^"]+)"/) || [])[1];
    return d ? `<path d="${d}" fill="${fill}"/>` : '';
  }).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="488" viewBox="0 0 1530 488">${paths}</svg>`);
}

async function renderLogo(fill, width = 610, height = 195, blur = 0) {
  let pipeline = sharp(exactLogoSvg(fill), { density: 240 })
    .resize(width, height, { fit: 'contain' })
    .ensureAlpha();
  if (blur > 0) pipeline = pipeline.blur(blur);
  return pipeline.png().toBuffer();
}

function exactUvLogoSvg() {
  const source = fs.readFileSync(logoPath, 'utf8');
  const tags = source.match(/<path\b[^>]*>/g) || [];
  const paths = tags.map((tag) => {
    const d = (tag.match(/d="([^"]+)"/) || [])[1];
    return d ? `<path d="${d}" fill="url(#uv-resin)"/>` : '';
  }).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="488" viewBox="0 0 1530 488">
    <defs>
      <linearGradient id="uv-resin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.66"/>
        <stop offset="0.14" stop-color="#FFFFFF" stop-opacity="0.34"/>
        <stop offset="0.38" stop-color="#DDF3FF" stop-opacity="0.13"/>
        <stop offset="0.63" stop-color="#8CCBFF" stop-opacity="0.05"/>
        <stop offset="0.80" stop-color="#0057B8" stop-opacity="0.13"/>
        <stop offset="1" stop-color="#F0FAFF" stop-opacity="0.30"/>
      </linearGradient>
      <filter id="uv-specular" x="-20%" y="-35%" width="140%" height="170%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="raised-surface"/>
        <feSpecularLighting in="raised-surface" surfaceScale="11" specularConstant="1.38" specularExponent="28" lighting-color="#FFFFFF" result="specular">
          <feDistantLight azimuth="225" elevation="52"/>
        </feSpecularLighting>
        <feComposite in="specular" in2="SourceAlpha" operator="in" result="clipped-specular"/>
        <feBlend in="SourceGraphic" in2="clipped-specular" mode="screen"/>
      </filter>
    </defs>
    <g filter="url(#uv-specular)">${paths}</g>
  </svg>`);
}

async function renderUvLogo() {
  return sharp(exactUvLogoSvg(), { density: 240 })
    .resize(610, 195, { fit: 'contain' })
    .ensureAlpha()
    .png()
    .toBuffer();
}

function exactUvOutlineSvg() {
  const source = fs.readFileSync(logoPath, 'utf8');
  const tags = source.match(/<path\b[^>]*>/g) || [];
  const paths = tags.map((tag) => {
    const d = (tag.match(/d="([^"]+)"/) || [])[1];
    return d ? `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity="0.72" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  }).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="488" viewBox="0 0 1530 488">${paths}</svg>`);
}

async function renderUvOutline() {
  return sharp(exactUvOutlineSvg(), { density: 240 })
    .resize(610, 195, { fit: 'contain' })
    .ensureAlpha()
    .blur(0.35)
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const base = await sharp(basePath)
    .resize(canvas.width, canvas.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.015, brightness: 0.995 })
    .sharpen({ sigma: 0.42, m1: 0.55, m2: 1.45 })
    .png()
    .toBuffer();

  const cardCrop = await sharp(base)
    .extract({ left: card.left, top: card.top, width: card.width, height: card.height })
    .png()
    .toBuffer();

  const { data: maskData, info: maskInfo } = await sharp(cardCrop)
    .greyscale()
    .threshold(78)
    .negate()
    .blur(1.1)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alphaMask = await sharp({
    create: {
      width: card.width,
      height: card.height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .joinChannel(maskData, { raw: maskInfo })
    .png()
    .toBuffer();

  const { data: cropPixels, info: cropInfo } = await sharp(cardCrop)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const handSeed = Buffer.alloc(card.width * card.height);
  for (let y = 0; y < card.height; y += 1) {
    for (let x = 0; x < card.width; x += 1) {
      if (x > 430 || y < 1390) continue;
      const pixelIndex = (y * card.width + x) * cropInfo.channels;
      const r = cropPixels[pixelIndex];
      const g = cropPixels[pixelIndex + 1];
      const b = cropPixels[pixelIndex + 2];
      const luminance = (r * 0.299) + (g * 0.587) + (b * 0.114);
      if (luminance > 48 || (b > 72 && b > r * 1.12)) handSeed[(y * card.width) + x] = 255;
    }
  }
  const { data: expandedHandMask, info: expandedHandInfo } = await sharp(handSeed, {
    raw: { width: card.width, height: card.height, channels: 1 },
  })
    .blur(13)
    .threshold(18)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const handAlpha = await sharp({
    create: {
      width: card.width,
      height: card.height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .joinChannel(expandedHandMask, { raw: expandedHandInfo })
    .png()
    .toBuffer();
  const handOverlay = await sharp(cardCrop)
    .ensureAlpha()
    .composite([{ input: handAlpha, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bluePaper = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">
    <defs>
      <linearGradient id="blue-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#168AFF"/>
        <stop offset="0.46" stop-color="#017AFB"/>
        <stop offset="1" stop-color="#0069DE"/>
      </linearGradient>
      <filter id="paper" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.33" numOctaves="3" seed="12" result="noise"/>
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.10 0" result="grain"/>
        <feBlend in="SourceGraphic" in2="grain" mode="soft-light"/>
      </filter>
    </defs>
    <rect width="${card.width}" height="${card.height}" rx="28" fill="url(#blue-paper)" filter="url(#paper)"/>
  </svg>`);

  const maskedBluePaper = await sharp(bluePaper)
    .ensureAlpha()
    .composite([{ input: alphaMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const logoShadow = await renderLogo('rgba(0,26,78,0.34)', 610, 195, 7);
  const logoLowerEdge = await renderLogo('rgba(0,58,145,0.28)');
  const logoTopEdge = await renderLogo('rgba(255,255,255,0.62)');
  const logoUvCore = await renderUvLogo();
  const logoUvOutline = await renderUvOutline();

  const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="820" height="130" viewBox="0 0 820 130">
    <text x="4" y="86" font-family="SF Pro Text" font-size="64" font-weight="400" letter-spacing="0" fill="#FFFFFF">Benly for everyone</text>
  </svg>`);

  await sharp(base)
    .composite([
      { input: maskedBluePaper, left: card.left, top: card.top, blend: 'over' },
      { input: handOverlay, left: card.left, top: card.top, blend: 'over' },
      { input: logoShadow, left: 3749, top: 890, blend: 'multiply' },
      { input: logoLowerEdge, left: 3745, top: 885, blend: 'over' },
      { input: logoTopEdge, left: 3735, top: 873, blend: 'screen' },
      { input: logoUvCore, left: 3739, top: 878, blend: 'screen' },
      { input: logoUvOutline, left: 3739, top: 878, blend: 'screen' },
      { input: textSvg, left: 3518, top: 2050, blend: 'over' },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
