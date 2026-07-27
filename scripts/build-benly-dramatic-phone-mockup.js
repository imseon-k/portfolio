const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const generatedPath = '/Users/imsunny/.codex/generated_images/019f7fe8-8db4-72f3-a3f4-cf6992924b97/exec-1f915d66-6297-489d-aa13-8a709f003e26.png';
const logoPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputDir = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals';
const baseCopyPath = path.join(outputDir, 'benly-dramatic-phone-mockup-base.png');
const finalPath = path.join(outputDir, 'benly-dramatic-phone-logo-mockup-8k.png');

function extractPaths(fill) {
  const source = fs.readFileSync(logoPath, 'utf8');
  const tags = source.match(/<path\b[^>]*>/g) || [];
  return tags.map((tag) => {
    const d = (tag.match(/d="([^"]+)"/) || [])[1];
    return d ? `<path d="${d}" fill="${fill}"/>` : '';
  }).join('');
}

function logoSvg(fill) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="488" viewBox="0 0 1530 488">
    ${extractPaths(fill)}
  </svg>`);
}

async function rotatedLogo(fill, { width, height, angle, blur = 0 }) {
  let pipeline = sharp(logoSvg(fill), { density: 220 })
    .resize(width, height, { fit: 'contain' })
    .ensureAlpha();
  if (blur > 0) pipeline = pipeline.blur(blur);
  const buffer = await pipeline.png().toBuffer();
  return sharp(buffer)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(generatedPath, baseCopyPath);

  const base = await sharp(generatedPath)
    .resize(7680, 4320, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.03, brightness: 0.99 })
    .sharpen({ sigma: 0.45, m1: 0.55, m2: 1.5 })
    .png()
    .toBuffer();

  const angle = 4.9;
  const glow = await rotatedLogo('#017AFB', { width: 760, height: 243, angle, blur: 20 });
  const core = await rotatedLogo('#FFFFFF', { width: 760, height: 243, angle });

  const swipeBar = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="350" height="70" viewBox="0 0 350 70">
    <rect x="25" y="24" width="300" height="18" rx="9" fill="#FFFFFF" fill-opacity="0.88"/>
  </svg>`);
  const rotatedBar = await sharp(swipeBar)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(base)
    .composite([
      { input: glow, left: 3380, top: 1700, blend: 'screen' },
      { input: core, left: 3380, top: 1700, blend: 'over' },
      { input: rotatedBar, left: 3625, top: 2750, blend: 'over' },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(finalPath);

  console.log(JSON.stringify({ baseCopyPath, finalPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
