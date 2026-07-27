const fs = require('fs');
const path = require('path');
const sharp = require('/Users/imsunny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const sourcePath = '/Users/imsunny/Library/CloudStorage/Dropbox/포트폴리오/00_종합/Graphic/프로젝트/Benly/benly-logo.svg';
const outputDir = '/Users/imsunny/Documents/Claude/Projects/Portfolio-lab/output/benly-visuals';
const visualizationDir = '/Users/imsunny/.codex/visualizations/2026/07/20/019f7fe8-8db4-72f3-a3f4-cf6992924b97';

const source = fs.readFileSync(sourcePath, 'utf8');
const pathTags = source.match(/<path\b[^>]*>/g) || [];
const parsedPaths = pathTags.map((tag) => ({
  fill: (tag.match(/fill="([^"]+)"/) || [])[1],
  d: (tag.match(/d="([^"]+)"/) || [])[1],
}));

const wordmarkPaths = parsedPaths.filter((item) => item.fill === 'black').map((item) => item.d);
const iconPaths = parsedPaths.filter((item) => item.fill === '#017AFB').map((item) => item.d);

if (wordmarkPaths.length !== 6 || iconPaths.length !== 13) {
  throw new Error(`Unexpected Benly path structure: ${wordmarkPaths.length} wordmark, ${iconPaths.length} icon paths`);
}

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function iconGroup(fill, extra = '') {
  return `<g fill="${fill}" ${extra}>${iconPaths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
}

function wordmarkGroup(fill, extra = '') {
  return `<g fill="${fill}" ${extra}>${wordmarkPaths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
}

function fullLogo(fillIcon, fillText, extra = '') {
  return `<g ${extra}>${iconGroup(fillIcon)}${wordmarkGroup(fillText)}</g>`;
}

function anchor(x, y, color, r = 18, inner = false) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${inner ? color : 'none'}" stroke="${color}" stroke-width="8"/>`;
}

function diagramSvg(c, { html = false } = {}) {
  const Korean = escapeXml('기억과 언어의 조각을 모아, 일상 속에서 꿈을 완성하다.');
  const cssClass = html ? ' class="benly-construction-svg"' : '';
  return `<svg${cssClass} xmlns="http://www.w3.org/2000/svg" width="7680" height="4320" viewBox="0 0 7680 4320" role="img" aria-labelledby="benly-title benly-desc">
  <title id="benly-title">Benly logo construction — assembling memory</title>
  <desc id="benly-desc">The exact Benly logo is deconstructed into memory and language fragments, then assembled into a completed dream.</desc>
  <defs>
    <linearGradient id="blue-cyan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.blue}"/>
      <stop offset="1" stop-color="${c.cyan}"/>
    </linearGradient>
    <radialGradient id="soft-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${c.blue}" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="${c.cyan}" stop-opacity="0.07"/>
      <stop offset="1" stop-color="${c.cyan}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="32" stdDeviation="44" flood-color="${c.foreground}" flood-opacity="0.10"/>
    </filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="26" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="memory-slice-1" clipPathUnits="userSpaceOnUse"><path d="M0 0H112V488H0Z"/></clipPath>
    <clipPath id="memory-slice-2" clipPathUnits="userSpaceOnUse"><path d="M112 0H228V488H112Z"/></clipPath>
    <clipPath id="memory-slice-3" clipPathUnits="userSpaceOnUse"><path d="M228 0H342V488H228Z"/></clipPath>
    <clipPath id="memory-slice-4" clipPathUnits="userSpaceOnUse"><path d="M342 0H470V488H342Z"/></clipPath>
    <pattern id="dot-grid" width="88" height="88" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="${c.line}" opacity="0.28"/>
    </pattern>
  </defs>

  <rect width="7680" height="4320" fill="${c.background}"/>
  <rect x="0" y="0" width="7680" height="4320" fill="url(#dot-grid)" opacity="0.52"/>
  <circle cx="6020" cy="2270" r="1270" fill="url(#soft-halo)"/>

  <g font-family="Arial, Helvetica, 'Apple SD Gothic Neo', sans-serif">
    <text x="480" y="390" fill="${c.blue}" font-size="62" font-weight="700" letter-spacing="15">BENLY · LOGO CONSTRUCTION</text>
    <text x="480" y="690" fill="${c.foreground}" font-size="230" font-weight="700" letter-spacing="-8">ASSEMBLING</text>
    <text x="480" y="915" fill="${c.foreground}" font-size="230" font-weight="300" letter-spacing="10">MEMORY</text>
    <text x="486" y="1085" fill="${c.muted}" font-size="61" font-weight="400" letter-spacing="1">${Korean}</text>

    <g transform="translate(6090 350)">
      <text x="0" y="0" fill="${c.muted}" font-size="46" font-weight="700" letter-spacing="8">FORMULA</text>
      <text x="0" y="128" fill="${c.foreground}" font-size="72" font-weight="600">MEMORY</text>
      <text x="450" y="128" fill="${c.blue}" font-size="72" font-weight="300">×</text>
      <text x="530" y="128" fill="${c.foreground}" font-size="72" font-weight="600">LANGUAGE</text>
      <path d="M0 205H1080" stroke="${c.line}" stroke-width="5"/>
      <text x="0" y="300" fill="${c.blue}" font-size="46" font-weight="700" letter-spacing="7">A DREAM, COMPLETED</text>
    </g>

    <path d="M480 1280H7200" stroke="${c.line}" stroke-width="5"/>

    <g transform="translate(480 1475)">
      <circle cx="53" cy="-18" r="53" fill="none" stroke="${c.blue}" stroke-width="8"/>
      <text x="53" y="2" text-anchor="middle" fill="${c.blue}" font-size="37" font-weight="700">01</text>
      <text x="135" y="0" fill="${c.foreground}" font-size="58" font-weight="700" letter-spacing="4">MEMORY FRAGMENTS</text>
      <text x="135" y="84" fill="${c.muted}" font-size="41" letter-spacing="2">므시모네 · 기억의 씨앗</text>
    </g>

    <g transform="translate(2460 1475)">
      <circle cx="53" cy="-18" r="53" fill="none" stroke="${c.blue}" stroke-width="8"/>
      <text x="53" y="2" text-anchor="middle" fill="${c.blue}" font-size="37" font-weight="700">02</text>
      <text x="135" y="0" fill="${c.foreground}" font-size="58" font-weight="700" letter-spacing="4">LANGUAGE FRAGMENTS</text>
      <text x="135" y="84" fill="${c.muted}" font-size="41" letter-spacing="2">일상의 단어 · 연결의 조각</text>
    </g>

    <g transform="translate(4930 1475)">
      <circle cx="53" cy="-18" r="53" fill="url(#blue-cyan)"/>
      <text x="53" y="2" text-anchor="middle" fill="${c.background}" font-size="37" font-weight="700">03</text>
      <text x="135" y="0" fill="${c.foreground}" font-size="58" font-weight="700" letter-spacing="4">DREAM, COMPLETED</text>
      <text x="135" y="84" fill="${c.muted}" font-size="41" letter-spacing="2">조립된 영감 · 살아 있는 목표</text>
    </g>

    <!-- Stage 1: the exact Mnemosyne symbol split into four memory fragments -->
    <g transform="translate(510 1750)">
      <rect x="0" y="0" width="1510" height="1575" rx="34" fill="none" stroke="${c.line}" stroke-width="5" stroke-dasharray="22 20"/>
      <path d="M755 -60V1635M-60 787H1570" stroke="${c.line}" stroke-width="4" stroke-dasharray="14 18" opacity="0.7"/>
      <circle cx="755" cy="787" r="585" fill="none" stroke="${c.line}" stroke-width="4" stroke-dasharray="12 20"/>
      <g transform="translate(135 155) scale(2.7)">
        ${iconGroup(c.blue, 'clip-path="url(#memory-slice-1)" transform="translate(-20 18)"')}
        ${iconGroup(c.cyan, 'clip-path="url(#memory-slice-2)" transform="translate(4 -12)"')}
        ${iconGroup(c.blue, 'clip-path="url(#memory-slice-3)" transform="translate(14 22)"')}
        ${iconGroup(c.cyan, 'clip-path="url(#memory-slice-4)" transform="translate(32 -18)"')}
      </g>
      <g fill="${c.background}" stroke="${c.blue}" stroke-width="8">
        <circle cx="0" cy="0" r="18"/><circle cx="1510" cy="0" r="18"/>
        <circle cx="0" cy="1575" r="18"/><circle cx="1510" cy="1575" r="18"/>
        <circle cx="755" cy="0" r="18"/><circle cx="755" cy="1575" r="18"/>
        <circle cx="0" cy="787" r="18"/><circle cx="1510" cy="787" r="18"/>
      </g>
      <path d="M210 1460H1300" stroke="${c.foreground}" stroke-width="5"/>
      <path d="M210 1435V1485M1300 1435V1485" stroke="${c.foreground}" stroke-width="5"/>
      <text x="755" y="1535" text-anchor="middle" fill="${c.muted}" font-size="36" letter-spacing="5">04 MEMORY SLICES</text>
      <circle cx="1290" cy="170" r="22" fill="${c.cyan}" filter="url(#glow)"/>
      <circle cx="250" cy="300" r="14" fill="${c.blue}"/>
      <path d="M250 300L405 435M1290 170L1120 360" stroke="${c.line}" stroke-width="5" stroke-dasharray="14 17"/>
    </g>

    <!-- Assembly vector -->
    <g>
      <path d="M2075 2535C2185 2535 2225 2535 2325 2535" stroke="url(#blue-cyan)" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M2282 2495L2330 2535L2282 2575" fill="none" stroke="${c.cyan}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="2200" y="2440" text-anchor="middle" fill="${c.muted}" font-size="30" font-weight="700" letter-spacing="5">ASSEMBLE</text>
    </g>

    <!-- Stage 2: exact Benly wordmark paths, slightly separated like movable pieces -->
    <g transform="translate(2350 1750)">
      <rect x="0" y="0" width="2220" height="1575" rx="34" fill="none" stroke="${c.line}" stroke-width="5" stroke-dasharray="22 20"/>
      <path d="M0 787H2220M1110 0V1575" stroke="${c.line}" stroke-width="4" stroke-dasharray="14 18" opacity="0.7"/>
      <g fill="${c.foreground}" transform="translate(-860 310) scale(2.03)">
        <path d="${wordmarkPaths[5]}" transform="translate(-22 28)"/>
        <path d="${wordmarkPaths[0]}" transform="translate(-10 -18)"/>
        <path d="${wordmarkPaths[1]}" transform="translate(0 30)"/>
        <path d="${wordmarkPaths[2]}" transform="translate(12 -24)"/>
        <path d="${wordmarkPaths[3]}" transform="translate(28 -8)"/>
        <path d="${wordmarkPaths[4]}" transform="translate(28 22)"/>
      </g>
      <g fill="${c.background}" stroke="${c.blue}" stroke-width="8">
        <circle cx="0" cy="0" r="18"/><circle cx="2220" cy="0" r="18"/>
        <circle cx="0" cy="1575" r="18"/><circle cx="2220" cy="1575" r="18"/>
        <circle cx="1110" cy="0" r="18"/><circle cx="1110" cy="1575" r="18"/>
        <circle cx="0" cy="787" r="18"/><circle cx="2220" cy="787" r="18"/>
      </g>
      <g fill="${c.background}" stroke="${c.cyan}" stroke-width="7">
        <circle cx="340" cy="620" r="16"/><circle cx="720" cy="500" r="16"/>
        <circle cx="1090" cy="635" r="16"/><circle cx="1382" cy="485" r="16"/>
        <circle cx="1760" cy="610" r="16"/><circle cx="1970" cy="920" r="16"/>
      </g>
      <path d="M340 620L720 500L1090 635L1382 485L1760 610L1970 920" stroke="${c.cyan}" stroke-width="5" stroke-dasharray="13 18" fill="none" opacity="0.75"/>
      <path d="M300 1460H1920" stroke="${c.foreground}" stroke-width="5"/>
      <path d="M300 1435V1485M1920 1435V1485" stroke="${c.foreground}" stroke-width="5"/>
      <text x="1110" y="1535" text-anchor="middle" fill="${c.muted}" font-size="36" letter-spacing="5">05 LETTER FORMS</text>
    </g>

    <!-- Assembly vector -->
    <g>
      <path d="M4625 2535C4710 2535 4745 2535 4840 2535" stroke="url(#blue-cyan)" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M4797 2495L4845 2535L4797 2575" fill="none" stroke="${c.cyan}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="4735" y="2440" text-anchor="middle" fill="${c.muted}" font-size="30" font-weight="700" letter-spacing="5">CONNECT</text>
    </g>

    <!-- Stage 3: the untouched original SVG geometry -->
    <g transform="translate(4880 1750)">
      <rect x="0" y="0" width="2320" height="1575" rx="34" fill="${c.card}" stroke="${c.line}" stroke-width="5" filter="url(#soft-shadow)"/>
      <path d="M1160 0V1575M0 787H2320" stroke="${c.line}" stroke-width="4" stroke-dasharray="14 18" opacity="0.65"/>
      <circle cx="485" cy="785" r="445" fill="none" stroke="${c.line}" stroke-width="4" stroke-dasharray="12 20"/>
      <circle cx="485" cy="785" r="360" fill="none" stroke="${c.line}" stroke-width="4" stroke-dasharray="12 20" opacity="0.65"/>
      <g transform="translate(95 480) scale(1.40)">
        ${fullLogo(c.blue, c.foreground)}
      </g>
      <g fill="${c.card}" stroke="${c.blue}" stroke-width="8">
        <circle cx="0" cy="0" r="18"/><circle cx="2320" cy="0" r="18"/>
        <circle cx="0" cy="1575" r="18"/><circle cx="2320" cy="1575" r="18"/>
        <circle cx="1160" cy="0" r="18"/><circle cx="1160" cy="1575" r="18"/>
        <circle cx="0" cy="787" r="18"/><circle cx="2320" cy="787" r="18"/>
      </g>
      <circle cx="2085" cy="275" r="44" fill="url(#blue-cyan)" filter="url(#glow)"/>
      <path d="M2085 190V360M2000 275H2170" stroke="${c.card}" stroke-width="9" stroke-linecap="round"/>
      <text x="1160" y="1430" text-anchor="middle" fill="${c.foreground}" font-size="52" font-weight="700" letter-spacing="7">MEMORY BECOMES MOMENTUM</text>
      <text x="1160" y="1505" text-anchor="middle" fill="${c.muted}" font-size="36" letter-spacing="3">THE EXACT BENLY SIGNATURE</text>
    </g>

    <g transform="translate(480 3660)">
      <path d="M0 0H6720" stroke="${c.line}" stroke-width="5"/>
      <text x="0" y="145" fill="${c.blue}" font-size="39" font-weight="700" letter-spacing="8">01 / REMEMBER</text>
      <text x="1720" y="145" fill="${c.blue}" font-size="39" font-weight="700" letter-spacing="8">02 / CONNECT</text>
      <text x="3500" y="145" fill="${c.blue}" font-size="39" font-weight="700" letter-spacing="8">03 / COMPLETE</text>
      <text x="6720" y="145" text-anchor="end" fill="${c.muted}" font-size="39" letter-spacing="4">MNEMOSYNE · MEMORY &amp; LANGUAGE</text>
      <path d="M0 245H6720" stroke="${c.line}" stroke-width="5"/>
      <text x="0" y="370" fill="${c.foreground}" font-size="54" font-weight="600">Fragments of memory and language become the shape of an everyday dream.</text>
      <text x="6720" y="370" text-anchor="end" fill="${c.blue}" font-size="45" font-weight="700" letter-spacing="7">BENLY / 2026</text>
    </g>
  </g>
</svg>`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(visualizationDir, { recursive: true });

  const exportColors = {
    background: '#F3F7F9',
    card: '#FFFFFF',
    foreground: '#212121',
    muted: '#69757F',
    line: '#BCCAD1',
    blue: '#017AFB',
    cyan: '#18CDB5',
  };

  const svg = diagramSvg(exportColors);
  const svgPath = path.join(outputDir, 'benly-logo-construction-8k.svg');
  const pngPath = path.join(outputDir, 'benly-logo-construction-8k.png');
  fs.writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(7680, 4320, { fit: 'fill' })
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true })
    .toFile(pngPath);

  const themeColors = {
    background: 'var(--background)',
    card: 'var(--card)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted-foreground)',
    line: 'var(--border)',
    blue: 'var(--viz-series-1)',
    cyan: 'var(--viz-series-2)',
  };
  const html = `<div id="benly-logo-construction">
  <style>
    #benly-logo-construction {
      width: 100%;
      min-width: 0;
      color: var(--foreground);
      background: transparent;
      font-family: var(--font-sans);
    }
    #benly-logo-construction .benly-construction-svg {
      display: block;
      width: 100%;
      height: auto;
      min-width: 0;
    }
  </style>
  ${diagramSvg(themeColors, { html: true })}
</div>`;
  fs.writeFileSync(path.join(visualizationDir, 'benly-logo-construction.html'), html);

  console.log(JSON.stringify({ svgPath, pngPath, visualization: path.join(visualizationDir, 'benly-logo-construction.html') }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
