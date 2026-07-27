const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const generatedPath = '/Users/imsunny/.codex/generated_images/019f7fe8-8db4-72f3-a3f4-cf6992924b97/exec-20668577-1915-49b3-95e6-8ee886834934.png';
const logoPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputDir = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals';
const baseCopyPath = path.join(outputDir, 'benly-macbook-mockup-base.png');
const finalPath = path.join(outputDir, 'benly-macbook-logo-mockup-8k.png');

const logoSource = fs.readFileSync(logoPath, 'utf8');
const pathTags = logoSource.match(/<path\b[^>]*>/g) || [];
const exactLogoPaths = pathTags.map((tag) => {
  const d = (tag.match(/d="([^"]+)"/) || [])[1];
  const fill = (tag.match(/fill="([^"]+)"/) || [])[1];
  if (!d || !fill) return '';
  const brandFill = fill === 'black' ? '#212121' : '#017AFB';
  return `<path d="${d}" fill="${brandFill}"/>`;
}).join('');

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="7680" height="4320" viewBox="0 0 7680 4320">
  <defs>
    <filter id="logo-shadow" x="-20%" y="-30%" width="140%" height="170%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#212121" flood-opacity="0.13"/>
    </filter>
    <radialGradient id="screen-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="screen-clip">
      <rect x="2035" y="842" width="3650" height="2255" rx="14"/>
    </clipPath>
  </defs>

  <g clip-path="url(#screen-clip)">
    <ellipse cx="3860" cy="1945" rx="1550" ry="850" fill="url(#screen-halo)"/>
    <g stroke="#AAB4BA" stroke-width="4" opacity="0.16">
      <path d="M2565 1425H5165M2565 1625H5165M2565 1825H5165M2565 2025H5165M2565 2225H5165M2565 2425H5165"/>
      <path d="M2565 1425V2425M2765 1425V2425M2965 1425V2425M3165 1425V2425M3365 1425V2425M3565 1425V2425M3765 1425V2425M3965 1425V2425M4165 1425V2425M4365 1425V2425M4565 1425V2425M4765 1425V2425M4965 1425V2425M5165 1425V2425"/>
    </g>
    <g transform="translate(2605 1560) scale(1.64)" filter="url(#logo-shadow)">
      ${exactLogoPaths}
    </g>
  </g>
</svg>`;

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(generatedPath, baseCopyPath);

  const base = await sharp(generatedPath)
    .resize(7680, 4320, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 0.92, brightness: 0.99 })
    .sharpen({ sigma: 0.45, m1: 0.6, m2: 1.6 })
    .png()
    .toBuffer();

  await sharp(base)
    .composite([{ input: Buffer.from(overlay), blend: 'over' }])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(finalPath);

  console.log(JSON.stringify({ baseCopyPath, finalPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
