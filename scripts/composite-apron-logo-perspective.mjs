import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const [basePath, logoPath, outputPath] = process.argv.slice(2);

if (!basePath || !logoPath || !outputPath) {
  throw new Error("Usage: node composite-apron-logo-perspective.mjs base.png logo.svg output.png");
}

const W = 7680;
const H = 4320;

const { data: base, info: baseInfo } = await sharp(basePath, { limitInputPixels: false })
  .resize(W, H, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 0.3 })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

if (baseInfo.channels !== 3) throw new Error("Expected an RGB base image.");

const { data: logo, info: logoInfo } = await sharp(logoPath, { density: 600 })
  .resize({ width: 1120, kernel: sharp.kernel.lanczos3 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const output = Buffer.from(base);

// The four corners follow the apron plane: the upper edge tilts slightly down
// to the right, while the lower edge opens as the bib comes toward the camera.
const TL = { x: 2790, y: 1220 };
const TR = { x: 3735, y: 1288 };
const BL = { x: 2665, y: 2465 };
const BR = { x: 3825, y: 2518 };

const cross = {
  x: TL.x - TR.x - BL.x + BR.x,
  y: TL.y - TR.y - BL.y + BR.y
};

function surface(u, v) {
  const x = TL.x + u * (TR.x - TL.x) + v * (BL.x - TL.x) + u * v * cross.x;
  const y = TL.y + u * (TR.y - TL.y) + v * (BL.y - TL.y) + u * v * cross.y;

  // A shallow vertical fabric fold runs through the right third of the print.
  const center = 0.72;
  const spread = 0.092;
  const q = (u - center) / spread;
  const g = Math.exp(-(q * q));
  const dx = -38 * g * Math.sin(Math.PI * v);
  const dy = 12 * g * Math.sin(2 * Math.PI * v);

  return { x: x + dx, y: y + dy };
}

function derivatives(u, v) {
  const dBxdu = (TR.x - TL.x) + v * cross.x;
  const dBydu = (TR.y - TL.y) + v * cross.y;
  const dBxdv = (BL.x - TL.x) + u * cross.x;
  const dBydv = (BL.y - TL.y) + u * cross.y;

  const center = 0.72;
  const spread = 0.092;
  const q = (u - center) / spread;
  const g = Math.exp(-(q * q));
  const dgdu = g * (-2 * (u - center) / (spread * spread));

  return {
    dxdu: dBxdu - 38 * dgdu * Math.sin(Math.PI * v),
    dxdv: dBxdv - 38 * g * Math.PI * Math.cos(Math.PI * v),
    dydu: dBydu + 12 * dgdu * Math.sin(2 * Math.PI * v),
    dydv: dBydv + 24 * Math.PI * g * Math.cos(2 * Math.PI * v)
  };
}

function inverseSurface(x, y) {
  let u = (x - TL.x) / (TR.x - TL.x);
  let v = (y - TL.y) / (BL.y - TL.y);

  for (let i = 0; i < 6; i++) {
    const p = surface(u, v);
    const j = derivatives(u, v);
    const fx = p.x - x;
    const fy = p.y - y;
    const det = j.dxdu * j.dydv - j.dxdv * j.dydu;
    if (Math.abs(det) < 1e-7) break;
    u -= (fx * j.dydv - fy * j.dxdv) / det;
    v -= (j.dxdu * fy - j.dydu * fx) / det;
  }

  return { u, v };
}

function sampleLogo(u, v) {
  const sx = Math.max(0, Math.min(logoInfo.width - 1, u * (logoInfo.width - 1)));
  const sy = Math.max(0, Math.min(logoInfo.height - 1, v * (logoInfo.height - 1)));
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(logoInfo.width - 1, x0 + 1);
  const y1 = Math.min(logoInfo.height - 1, y0 + 1);
  const tx = sx - x0;
  const ty = sy - y0;
  const result = [0, 0, 0, 0];

  for (let c = 0; c < 4; c++) {
    const a = logo[(y0 * logoInfo.width + x0) * 4 + c];
    const b = logo[(y0 * logoInfo.width + x1) * 4 + c];
    const c0 = logo[(y1 * logoInfo.width + x0) * 4 + c];
    const d = logo[(y1 * logoInfo.width + x1) * 4 + c];
    result[c] = (a * (1 - tx) + b * tx) * (1 - ty) + (c0 * (1 - tx) + d * tx) * ty;
  }

  return result;
}

const minX = 2580;
const maxX = 3900;
const minY = 1140;
const maxY = 2585;

for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const { u, v } = inverseSurface(x + 0.5, y + 0.5);
    if (u < 0 || u > 1 || v < 0 || v > 1) continue;

    const [lr, lg, lb, la] = sampleLogo(u, v);
    if (la < 1) continue;

    const index = (y * W + x) * 3;
    const br = base[index];
    const bg = base[index + 1];
    const bb = base[index + 2];
    const luminance = 0.2126 * br + 0.7152 * bg + 0.0722 * bb;

    // Preserve the SVG colors while allowing the canvas highlights and folds
    // to shade the ink. A small amount of the base texture remains visible.
    const shade = Math.max(0.70, Math.min(1.04, luminance / 236));
    const multiplyR = lr * br / 255;
    const multiplyG = lg * bg / 255;
    const multiplyB = lb * bb / 255;
    const inkR = Math.max(0, Math.min(255, (lr * shade) * 0.76 + multiplyR * 0.24));
    const inkG = Math.max(0, Math.min(255, (lg * shade) * 0.76 + multiplyG * 0.24));
    const inkB = Math.max(0, Math.min(255, (lb * shade) * 0.76 + multiplyB * 0.24));

    const leftIndex = (y * W + Math.max(0, x - 8)) * 3;
    const rightIndex = (y * W + Math.min(W - 1, x + 8)) * 3;
    const upIndex = (Math.max(0, y - 8) * W + x) * 3;
    const downIndex = (Math.min(H - 1, y + 8) * W + x) * 3;
    const neighborLuminance = (
      0.2126 * (base[leftIndex] + base[rightIndex] + base[upIndex] + base[downIndex]) +
      0.7152 * (base[leftIndex + 1] + base[rightIndex + 1] + base[upIndex + 1] + base[downIndex + 1]) +
      0.0722 * (base[leftIndex + 2] + base[rightIndex + 2] + base[upIndex + 2] + base[downIndex + 2])
    ) / 4;
    const fiber = Math.max(0.86, Math.min(1.12, 1 + (luminance - neighborLuminance) / 22));
    const alpha = Math.min(0.80, (la / 255) * 0.74 * fiber);

    output[index] = Math.round(br * (1 - alpha) + inkR * alpha);
    output[index + 1] = Math.round(bg * (1 - alpha) + inkG * alpha);
    output[index + 2] = Math.round(bb * (1 - alpha) + inkB * alpha);
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await sharp(output, { raw: { width: W, height: H, channels: 3 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .withMetadata({ density: 144 })
  .toFile(outputPath);

await fs.writeFile(
  `${outputPath}.json`,
  JSON.stringify({
    basePath,
    logoPath,
    outputPath,
    resolution: `${W}x${H}`,
    corners: { TL, TR, BL, BR },
    opacity: 0.74,
    foldCenter: 0.72
  }, null, 2),
  "utf8"
);

console.log(outputPath);
