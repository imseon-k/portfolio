const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const sourcePath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로제트/Benly/benly-logo.svg';
const fallbackSourcePath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputDir = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals';
const visualizationDir = '/Users/imsunny/.codex/visualizations/2026/07/20/019f7fe8-8db4-72f3-a3f4-cf6992924b97';

const resolvedSourcePath = fs.existsSync(sourcePath) ? sourcePath : fallbackSourcePath;
const source = fs.readFileSync(resolvedSourcePath, 'utf8');
const pathTags = source.match(/<path\b[^>]*>/g) || [];
const paths = pathTags.map((tag) => (tag.match(/d="([^"]+)"/) || [])[1]).filter(Boolean);

if (paths.length !== 19) throw new Error(`Expected 19 logo paths, received ${paths.length}`);

function outlinePaths(stroke) {
  return paths.map((d) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="7" vector-effect="non-scaling-stroke"/>`).join('');
}

function dot(x, y, c, filled = false, r = 17) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${filled ? c.foreground : c.background}" stroke="${c.foreground}" stroke-width="6" vector-effect="non-scaling-stroke"/>`;
}

function logoSpaceDot(x, y, c, filled = false, r = 6) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${filled ? c.foreground : c.background}" stroke="${c.foreground}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}

function diagram(c, { html = false } = {}) {
  const svgClass = html ? ' class="benly-wireframe-svg"' : '';
  const markerPoints = [
    [195, 8], [26, 222], [195, 476], [453, 222],
    [669, 372], [696, 224], [758, 199], [848, 286],
    [873, 278], [959, 197], [1042, 278],
    [1077, 374], [1162, 197], [1233, 374],
    [1277, 139], [1306, 374],
    [1340, 349], [1422, 404], [1478, 138], [1505, 349],
  ];

  return `<svg${svgClass} xmlns="http://www.w3.org/2000/svg" width="7680" height="4320" viewBox="0 0 7680 4320" role="img" aria-labelledby="wire-title wire-desc">
  <title id="wire-title">Benly logo wireframe construction</title>
  <desc id="wire-desc">The exact Benly logo outlined with clean construction guides, measurement points, and anchor nodes.</desc>
  <defs>
    <pattern id="wire-grid" width="160" height="160" patternUnits="userSpaceOnUse">
      <path d="M160 0H0V160" fill="none" stroke="${c.guide}" stroke-width="2" opacity="0.18"/>
    </pattern>
  </defs>

  <rect width="7680" height="4320" fill="${c.background}"/>
  <rect width="7680" height="4320" fill="url(#wire-grid)" opacity="0.16"/>

  <!-- Overall construction field -->
  <g fill="none" stroke="${c.guide}" stroke-width="5">
    <rect x="480" y="1035" width="6720" height="2145" stroke-dasharray="22 22"/>
    <path d="M480 2107.5H7200M3840 1035V3180" stroke-dasharray="18 22"/>
    <path d="M594 1465H7086M594 2638H7086" stroke-dasharray="15 21" opacity="0.8"/>
  </g>

  <!-- Exact logo outline -->
  <g transform="translate(505 1050) scale(4.35)">
    ${outlinePaths(c.foreground)}

    <!-- Letter and symbol construction boxes -->
    <g fill="none" stroke="${c.guide}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-dasharray="7 8">
      <rect x="26" y="8" width="427" height="468"/>
      <rect x="669" y="125" width="179" height="250"/>
      <rect x="872" y="197" width="170" height="178"/>
      <rect x="1077" y="197" width="156" height="178"/>
      <rect x="1277" y="139" width="29" height="235"/>
      <rect x="1340" y="138" width="165" height="266"/>
      <path d="M0 125H1530M0 197H1530M0 374H1530M0 404H1530"/>
      <path d="M26 0V488M453 0V488M669 0V488M848 0V488M872 0V488M1042 0V488M1077 0V488M1233 0V488M1277 0V488M1306 0V488M1340 0V488M1505 0V488" opacity="0.65"/>
    </g>

    <!-- Selected anchor points on the real logo geometry -->
    <g>${markerPoints.map(([x, y], index) => logoSpaceDot(x, y, c, index === 0 || index === 19)).join('')}</g>
  </g>

  <!-- External dimensions, modeled after the supplied reference -->
  <g fill="none" stroke="${c.foreground}" stroke-width="6">
    <path d="M505 755H7160"/>
    <path d="M505 755V1010M7160 755V1010" stroke="${c.guide}" stroke-dasharray="18 20"/>
    <path d="M275 1085V3130"/>
    <path d="M275 1085H455M275 3130H455" stroke="${c.guide}" stroke-dasharray="18 20"/>
    <path d="M505 3455H2475"/>
    <path d="M505 3210V3455M2475 3210V3455" stroke="${c.guide}" stroke-dasharray="18 20"/>
    <path d="M3415 3455H5005"/>
    <path d="M3415 3210V3455M5005 3210V3455" stroke="${c.guide}" stroke-dasharray="18 20"/>
    <path d="M6335 3455H7160"/>
    <path d="M6335 3210V3455M7160 3210V3455" stroke="${c.guide}" stroke-dasharray="18 20"/>
  </g>

  <g>
    ${dot(505, 755, c, true)}${dot(7160, 755, c, true)}
    ${dot(275, 1085, c, true)}${dot(275, 3130, c, true)}
    ${dot(505, 3455, c, true)}${dot(2475, 3455, c, true)}
    ${dot(3415, 3455, c, true)}${dot(5005, 3455, c, true)}
    ${dot(6335, 3455, c, true)}${dot(7160, 3455, c, true)}

    ${dot(480, 1035, c)}${dot(3840, 1035, c)}${dot(7200, 1035, c)}
    ${dot(480, 2108, c)}${dot(7200, 2108, c)}
    ${dot(480, 3180, c)}${dot(3840, 3180, c)}${dot(7200, 3180, c)}
  </g>
</svg>`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(visualizationDir, { recursive: true });

  const exportColors = {
    background: '#F0F0F0',
    foreground: '#212121',
    guide: '#AEB3B7',
  };
  const svg = diagram(exportColors);
  const svgPath = path.join(outputDir, 'benly-logo-wireframe-clean-8k.svg');
  const pngPath = path.join(outputDir, 'benly-logo-wireframe-clean-8k.png');
  fs.writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(7680, 4320, { fit: 'fill' })
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(pngPath);

  const htmlColors = {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    guide: 'var(--border)',
  };
  const html = `<div id="benly-logo-wireframe-clean">
  <style>
    #benly-logo-wireframe-clean {
      width: 100%;
      min-width: 0;
      background: transparent;
    }
    #benly-logo-wireframe-clean .benly-wireframe-svg {
      display: block;
      width: 100%;
      height: auto;
      min-width: 0;
    }
  </style>
  ${diagram(htmlColors, { html: true })}
</div>`;
  const htmlPath = path.join(visualizationDir, 'benly-logo-wireframe-clean.html');
  fs.writeFileSync(htmlPath, html);

  console.log(JSON.stringify({ pngPath, svgPath, htmlPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
