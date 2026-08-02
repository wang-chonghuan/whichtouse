#!/usr/bin/env node
// Cuts the topbar wordmark out of the raster master.
//
//   node scripts/crop-wordmark.mjs
//
// Source of truth: resources/wtu-logo-name.png — a 1536x1024 render with the
// lettering floating in a mostly empty transparent field. Shipping that file is
// 2 MB for a 30px-tall logo, so this crops to the ink, keeps a margin for the
// neon bloom, and writes the two sizes the <img> actually asks for.
//
// The crop box is measured, not hard-coded: the alpha channel gives the exact
// bounding box of the lettering, so re-rendering the master at a different
// position or scale needs no edit here. MARGIN is a fraction of the ink height
// rather than a pixel count for the same reason.
//
// Rendering runs in Playwright's Chromium, matching scripts/gen-icons.mjs: the
// project already depends on it, and the browser that resamples the image here
// is the one that will display it.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(here, '../../resources/wtu-logo-name.png')
const OUT = path.join(here, '../public')

// The glow is what makes the mark a neon sign rather than a script font, and
// cropping to the letters alone slices it off mid-fade. 15% of the ink height
// is where the bloom has died down enough that the cut is invisible.
const MARGIN = 0.15

// Displayed at 34px tall (see `Wordmark` in src/components/bits.tsx).
//
// 34 rather than the 30 that matches the nav labels' cap height: this is a
// script, and a script loses its joins before an upright face loses its stems.
// It was compared against the bar at 26, 30 and 34 — the first two read as a
// caption next to "Browse", not as the name of the site.
const HEIGHT = 34

// 2x covers every retina screen the site sees; the 1x file is under 4 kB, and a
// phone on cellular should not pay for pixels it cannot show. The larger sizes
// are whole multiples of the 1x pixel box rather than independent rounds of the
// crop, so every file in the set has the identical aspect ratio — otherwise the
// <img> reflows by a fraction of a pixel when a denser source replaces the
// width/height attributes' ratio.
const DENSITIES = [1, 2]

// WebP, not PNG: the bloom is a wide smooth gradient, which is the case PNG's
// per-row filters handle worst and a lossy codec handles best. At q=0.92 the
// two are indistinguishable at display size and WebP is less than half the
// bytes. Alpha survives — the header is white today but the file should not
// assume that.
const QUALITY = 0.92

const browser = await chromium.launch()
const page = await browser.newPage()

const rendered = await page.evaluate(
  async ({ src, margin, height, densities, quality }) => {
    const img = new Image()
    img.src = src
    await img.decode()

    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, c.width, c.height).data

    // Threshold well above the bloom: the letters are opaque, the glow around
    // them is not, and a low threshold would return the whole canvas.
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        if (data[(y * c.width + x) * 4 + 3] < 160) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
    if (x1 < 0) throw new Error('no opaque pixels found in the master')

    const pad = Math.round((y1 - y0 + 1) * margin)
    const box = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 1 + pad * 2, h: y1 - y0 + 1 + pad * 2 }

    const baseWidth = Math.round((box.w * height) / box.h)

    return {
      ink: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 },
      box,
      files: densities.map((d) => {
        const w = baseWidth * d
        const h = height * d
        const out = document.createElement('canvas')
        out.width = w
        out.height = h
        const octx = out.getContext('2d')
        octx.imageSmoothingQuality = 'high'
        octx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, w, h)
        return { d, w, h, url: out.toDataURL('image/webp', quality) }
      }),
    }
  },
  {
    src: 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64'),
    margin: MARGIN,
    height: HEIGHT,
    densities: DENSITIES,
    quality: QUALITY,
  },
)

await browser.close()

console.log(`ink ${rendered.ink.w}x${rendered.ink.h} at ${rendered.ink.x},${rendered.ink.y}`)
console.log(`crop ${rendered.box.w}x${rendered.box.h}`)
for (const file of rendered.files) {
  const name = `wordmark-${file.w}.webp`
  const bytes = Buffer.from(file.url.split(',')[1], 'base64')
  fs.writeFileSync(path.join(OUT, name), bytes)
  console.log(`${name}  ${file.w}x${file.h}  ${(bytes.length / 1024).toFixed(1)} kB`)
}
