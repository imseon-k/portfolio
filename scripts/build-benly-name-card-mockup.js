const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const generatedPath = '/Users/imsunny/.codex/generated_images/019f7fe8-8db4-72f3-a3f4-cf6992924b97/exec-9da6c966-7bd3-458a-8a5b-a0806be0bb1a.png';
const logoPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputDir = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals';
const baseCopyPath = path.join(outputDir, 'benly-name-card-mockup-base.png');
const finalPath = path.join(outputDir, 'benly-name-card-mockup-8k.png');

function exactLogoSvg() {
  const source = fs.readFileSync(logoPath, 'utf8');
  const tags = source.match(/<path\b[^>]*>/g) || [];
  const paths = tags.map((tag) => {
    const d = (tag.match(/d="([^"]+)"/) || [])[1];
    const sourceFill = (tag.match(/fill="([^"]+)"/) || [])[1];
    if (!d || !sourceFill) return '';
    const fill = sourceFill === 'black' ? '#FFFFFF' : '#017AFB';
    return `<path d="${d}" fill="${fill}"/>`;
  }).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="488" viewBox="0 0 1530 488">${paths}</svg>`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(generatedPath, baseCopyPath);

  const base = await sharp(generatedPath)
    .resize(7680, 4320, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.015, brightness: 0.995 })
    .sharpen({ sigma: 0.42, m1: 0.55, m2: 1.45 })
    .png()
    .toBuffer();

  const horizontalLogo = await sharp(exactLogoSvg(), { density: 220 })
    .resize(1000, 319, { fit: 'contain' })
    .ensureAlpha()
    .png()
    .toBuffer();

  const verticalLogo = await sharp(horizontalLogo)
    .rotate(90, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const blueGlow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="430" height="1110" viewBox="0 0 430 1110">
    <defs><filter id="g" x="-80%" y="-40%" width="260%" height="180%"><feGaussianBlur stdDeviation="24"/></filter></defs>
    <rect x="75" y="55" width="280" height="1000" rx="70" fill="#017AFB" fill-opacity="0.10" filter="url(#g)"/>
  </svg>`);

  await sharp(base)
    .composite([
      { input: blueGlow, left: 3940, top: 995, blend: 'screen' },
      { input: verticalLogo, left: 3995, top: 1050, blend: 'over' },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(finalPath);

  console.log(JSON.stringify({ baseCopyPath, finalPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
