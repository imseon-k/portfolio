import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const [inputSvg, outputSvg, outputPng] = process.argv.slice(2);

if (!inputSvg || !outputSvg || !outputPng) {
  throw new Error("Usage: node generate-youthmall-logotype-wireframe.mjs input.svg output.svg output.png");
}

const source = await fs.readFile(inputSvg, "utf8");
const pathMatch = source.match(/<path\b[^>]*\bd="([^"]+)"[^>]*>/i);

if (!pathMatch) {
  throw new Error("The source SVG does not contain a path element.");
}

const d = pathMatch[1];

function parsePath(pathData) {
  const tokens = pathData.match(/[MLCHVZ]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g);
  const points = [];
  const handles = [];
  let command = null;
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let index = 0;

  const isCommand = (value) => /^[MLCHVZ]$/.test(value);
  const number = () => Number(tokens[index++]);

  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++];
    if (!command) throw new Error("Malformed SVG path data.");

    if (command === "M") {
      current = { x: number(), y: number() };
      start = { ...current };
      points.push({ ...current, type: "anchor" });
      command = "L";
    } else if (command === "L") {
      current = { x: number(), y: number() };
      points.push({ ...current, type: "anchor" });
    } else if (command === "H") {
      current = { x: number(), y: current.y };
      points.push({ ...current, type: "anchor" });
    } else if (command === "V") {
      current = { x: current.x, y: number() };
      points.push({ ...current, type: "anchor" });
    } else if (command === "C") {
      const from = { ...current };
      const c1 = { x: number(), y: number() };
      const c2 = { x: number(), y: number() };
      const to = { x: number(), y: number() };
      handles.push({ from, c1, c2, to });
      points.push({ ...to, type: "anchor" });
      current = to;
    } else if (command === "Z") {
      current = { ...start };
      command = null;
    }
  }

  return { points, handles };
}

const { points, handles } = parsePath(d);

const canvas = { width: 1920, height: 1080 };
const sourceBox = { width: 172, height: 88 };
const scale = 8.56;
const tx = (canvas.width - sourceBox.width * scale) / 2;
const ty = (canvas.height - sourceBox.height * scale) / 2 + 10;

const majorY = [2, 7.1, 14.1, 18.1, 23.2, 27.5, 31, 39, 43.8, 47.8, 52.7, 57.7, 63.2, 67.3, 73.2, 78.4, 84.9, 86.9];
const majorX = [4, 15.3, 23, 35.9, 43.6, 51.8, 59, 68.8, 74.7, 83.4, 91.2, 99.4, 109.5, 113.8, 123.1, 131.1, 152.5, 160.5, 168];

const line = (x1, y1, x2, y2, cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;

const horizontalGrid = majorY
  .map((y, i) => line(80, ty + y * scale, 1840, ty + y * scale, i === 0 || i === majorY.length - 1 ? "grid boundary" : "grid"))
  .join("");

const verticalGrid = majorX
  .map((x, i) => line(tx + x * scale, 80, tx + x * scale, 1000, i === 0 || i === majorX.length - 1 ? "grid boundary" : "grid"))
  .join("");

const controlLines = handles
  .map(({ from, c1, c2, to }) => `${line(from.x, from.y, c1.x, c1.y, "handle-line")}${line(to.x, to.y, c2.x, c2.y, "handle-line")}`)
  .join("");

const controlPoints = handles
  .flatMap(({ c1, c2 }) => [c1, c2])
  .map(({ x, y }) => `<circle cx="${x}" cy="${y}" r="0.68" class="control-point"/>`)
  .join("");

const anchorPoints = points
  .map(({ x, y }) => `<rect x="${x - 0.72}" y="${y - 0.72}" width="1.44" height="1.44" rx="0.08" class="anchor-point"/>`)
  .join("");

const moduleCircles = [
  { cx: 34.65, cy: 67.35, r: 16.15 },
  { cx: 34.65, cy: 67.35, r: 12.25 },
  { cx: 105.1, cy: 13.5, r: 6.35 },
  { cx: 105.1, cy: 31.0, r: 3.75 },
  { cx: 143.7, cy: 35.5, r: 9.7 },
  { cx: 143.7, cy: 55.4, r: 9.7 }
].map(({ cx, cy, r }) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="module-circle"/>`).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="7680" height="4320" viewBox="0 0 ${canvas.width} ${canvas.height}" fill="none">
  <rect width="1920" height="1080" fill="#FFFFFF"/>
  <g aria-label="construction grid">
    ${horizontalGrid}
    ${verticalGrid}
  </g>
  <rect x="${tx + 4 * scale}" y="${ty + 2 * scale}" width="${164 * scale}" height="${84.94 * scale}" class="overall-box"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})" aria-label="exact source logotype wireframe">
    ${moduleCircles}
    ${controlLines}
    <path d="${d}" class="logo-outline"/>
    ${controlPoints}
    ${anchorPoints}
  </g>
  <g aria-label="corner registration marks">
    <path d="M96 122H160M128 90V154M1760 122H1824M1792 90V154M96 958H160M128 926V990M1760 958H1824M1792 926V990" class="registration"/>
  </g>
  <style>
    .grid { stroke: #E9E9E9; stroke-width: 1; }
    .grid.boundary { stroke: #D6D6D6; stroke-width: 1.35; }
    .overall-box { stroke: #CFCFCF; stroke-width: 1.15; stroke-dasharray: 8 7; }
    .module-circle { stroke: #D3D3D3; stroke-width: 0.12; }
    .handle-line { stroke: #C1C1C1; stroke-width: 0.12; }
    .logo-outline { fill: none; stroke: #8E8E8E; stroke-width: 0.19; stroke-linejoin: round; stroke-linecap: round; }
    .control-point { fill: #FFFFFF; stroke: #AAAAAA; stroke-width: 0.22; }
    .anchor-point { fill: #8F8F8F; stroke: #FFFFFF; stroke-width: 0.16; }
    .registration { stroke: #D2D2D2; stroke-width: 1.2; }
  </style>
</svg>`;

await fs.mkdir(path.dirname(outputSvg), { recursive: true });
await fs.writeFile(outputSvg, svg, "utf8");

await sharp(Buffer.from(svg), { limitInputPixels: false })
  .resize(7680, 4320, { fit: "fill" })
  .removeAlpha()
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .withMetadata({ density: 144 })
  .toFile(outputPng);

console.log(JSON.stringify({ outputSvg, outputPng, anchors: points.length, bezierSegments: handles.length }, null, 2));
