# /graphic — Image Placement Guide

_All HTML and image files for the sub-site live in this folder._

This folder holds all images used by `index.html` and the six detail pages (`01.html` … `06.html`).

The HTML currently renders diagonal-striped pink placeholders wherever an image goes. Each placeholder has an HTML comment above it with the exact filename to drop in.

## Naming convention

### Gallery thumbnails (used on `index.html`)

Square (1:1) thumbnails for each piece card.

```
thumb-01.png
thumb-02.png
thumb-03.png
thumb-04.png
thumb-05.png
thumb-06.png
```

Recommended: **800 × 800 px**, PNG or JPG. They will be cropped to fit the square card.

### Detail page images (used on `01.html` … `06.html`)

Each detail page has **1 hero + up to 3 supporting images**.

```
01-hero.png     ← hero image, 4:5 portrait
01-02.png       ← supporting, 4:3 landscape
01-03.png       ← supporting, 4:3 landscape
01-04.png       ← optional 3rd supporting, 4:3 (uncomment in HTML to show)

02-hero.png
02-02.png
02-03.png
...
06-hero.png
06-02.png
06-03.png
```

Recommended sizes:
- Hero: **1200 × 1500 px** (4:5 portrait)
- Supporting: **1200 × 900 px** (4:3 landscape)

## How to swap a placeholder for a real image

Open the relevant HTML file. Every placeholder block looks like this:

```html
<div class="frame">
  <!-- Replace with: <img src="01-hero.png" alt="Piece 01 hero image"> -->
  <div class="placeholder">01 · HERO</div>
</div>
```

Just delete the `<div class="placeholder">…</div>` line and uncomment the `<img>` tag. No CSS changes needed — the frame keeps the border, shadow, and aspect ratio.

## Customizing piece titles / categories

On `index.html`, each card has three fields to edit:

```html
<span class="card-cat">poster</span>      ← category
<span class="card-title">Piece Title 01</span>   ← title
<span class="card-year">2025</span>       ← year
```

On each detail page (`0X.html`), edit:
- `<h1 class="head-title">` — piece title
- `.head-eyebrow` — `▸ piece 01 / poster` → change the category after the slash
- `.meta-value` cells — year, tool, role
- `.head-desc` — short description paragraph
- `.caption-text` — designer's note block

## About the optional 3rd supporting image

Each detail template includes a commented-out 3rd supporting frame near the bottom of the `.stack` section:

```html
<!-- Optional 3rd supporting image — uncomment if needed:
<div class="frame">
  <div class="placeholder">01 · 04</div>
</div>
-->
```

Uncomment if the piece benefits from a third image. Otherwise leave it out — two supporting images is the default brief.

## Pixel fonts used

- **Pixelify Sans** — display / titles / UI chrome
- **DotGothic16** — body copy (Korean-friendly)
- **VT323** — fallback monospace

All loaded from Google Fonts; no self-hosted files needed.

## Color palette

| Token | Hex | Use |
|---|---|---|
| `--px-pink` | `#FF2EA6` | primary accent (top bar, shadows, eyebrows) |
| `--px-pink-2` | `#FFD6EC` | placeholder stripes, soft blocks |
| `--px-pink-3` | `#FFF0F7` | stats strip, meta strip |
| `--px-ink` | `#0A0A0A` | borders, body text, hard shadows |
| `--px-paper` | `#FFFFFF` | base background |

Edit these at the top of each HTML file's `<style>` block if you want a palette tweak.
