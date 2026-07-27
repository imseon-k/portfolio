const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const basePath = '/Users/imsunny/.codex/generated_images/019f7fe8-8db4-72f3-a3f4-cf6992924b97/exec-715f3c67-1e60-45ac-abe3-f1fda8b43b9d.png';
const logoPath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputPath = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals/benly-ivory-business-card-mockup-8k.png';

const canvas = { width: 7680, height: 4320 };
const cardCenter = { x: 4090, y: 1950 };

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const base = await sharp(basePath)
    .resize(canvas.width, canvas.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.995, saturation: 0.96 })
    .sharpen({ sigma: 0.42, m1: 0.45, m2: 1.1 })
    .png()
    .toBuffer();

  let logoSvg = fs.readFileSync(logoPath, 'utf8');
  logoSvg = logoSvg
    .replace(/fill="black"/g, 'fill="#212121"')
    .replace(/<svg([^>]*)>/, '<svg$1><g opacity="0.93">')
    .replace('</svg>', '</g></svg>');

  const logo = await sharp(Buffer.from(logoSvg), { density: 420 })
    .resize({ width: 1880, kernel: sharp.kernel.lanczos3 })
    .blur(0.32)
    .rotate(-7.1, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const logoPosition = {
    left: Math.round(cardCenter.x - logoMeta.width / 2),
    top: Math.round(cardCenter.y - logoMeta.height / 2),
  };

  await sharp(base)
    .composite([
      {
        input: logo,
        left: logoPosition.left,
        top: logoPosition.top,
        blend: 'multiply',
      },
    ])
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(outputPath);

  console.log(JSON.stringify({ outputPath, logoMeta, logoPosition }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
