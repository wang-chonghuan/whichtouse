#!/usr/bin/env node
// Regenerates every icon and the social card from the one master logo.
//
//   node scripts/gen-icons.mjs
//
// Source of truth: resources/reference/wtu-logo.png (1254², mark on a near-white
// field). Everything under app/public/ that shows the brand is derived here, so
// a new logo is one file swap and one command rather than a hunt through the
// repo.
//
// Rendering runs in Playwright's Chromium rather than an image library: the
// project already depends on it for verification, and canvas gives us the
// high-quality downscaler, the padding maths and the social card in one place
// without adding sharp/ImageMagick to the toolchain.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(here, '../../resources/reference/wtu-logo.png')
const OUT = path.join(here, '../public')

// The mark does not fill its own canvas — it ships with ~14% padding baked in,
// and it is wider than it is tall. Every output re-crops to the measured
// content box and re-pads deliberately, so "padding" below means what the
// platform actually sees.
const PADDING = {
  favicon: 0.06, // tiny sizes: the mark needs the pixels more than it needs air
  touch: 0.1, // iOS rounds the corners itself and adds nothing
  android: 0.1,
  maskable: 0.2, // Android may crop to a circle; keep content in the safe zone
}

const BACKGROUND = '#ffffff'

/** Icons are square and opaque. A transparent favicon inverts unpredictably
 * against light and dark browser chrome; a white tile never does. */
const PNG_TARGETS = [
  { file: 'favicon-16x16.png', size: 16, pad: PADDING.favicon },
  { file: 'favicon-32x32.png', size: 32, pad: PADDING.favicon },
  { file: 'favicon-48x48.png', size: 48, pad: PADDING.favicon },
  // Kept because older markup and caches still point at it.
  { file: 'favicon.png', size: 32, pad: PADDING.favicon },
  { file: 'apple-touch-icon.png', size: 180, pad: PADDING.touch },
  { file: 'icon-192.png', size: 192, pad: PADDING.android },
  { file: 'icon-512.png', size: 512, pad: PADDING.android },
  { file: 'icon-maskable-512.png', size: 512, pad: PADDING.maskable },
  // In-app: the mark in the top nav, at 2× for retina.
  { file: 'logo-mark-64.png', size: 64, pad: PADDING.favicon },
  { file: 'logo-mark.png', size: 512, pad: PADDING.favicon },
  { file: 'logo-mark-96.png', size: 96, pad: PADDING.favicon },
]

const ICO_SIZES = [16, 32, 48]

/** Packs PNGs into an .ico container. Every browser in support and Windows
 * Vista onward read PNG-compressed ICO entries, so there is no reason to emit
 * BMP payloads. */
function buildIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(pngs.length, 4)

  const entries = []
  let offset = 6 + pngs.length * 16
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2) // palette size
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += data.length
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)])
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto('about:blank')

const source = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64')

// One measurement, reused by every target.
const box = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const at = (x, y) => {
    const i = (y * canvas.width + x) * 4
    return [data[i], data[i + 1], data[i + 2]]
  }
  const bg = at(2, 2)
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const [r, g, b] = at(x, y)
      if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) > 40) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}, source)

console.log(`content box ${box.w}×${box.h} at (${box.x}, ${box.y})`)

async function render(size, pad) {
  const dataUrl = await page.evaluate(
    async ({ src, size, pad, box, background }) => {
      const img = new Image()
      img.src = src
      await img.decode()

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.fillStyle = background
      ctx.fillRect(0, 0, size, size)

      // Fit the content box inside the padded square without distorting it.
      const inner = size * (1 - pad * 2)
      const scale = Math.min(inner / box.w, inner / box.h)
      const w = box.w * scale
      const h = box.h * scale
      ctx.drawImage(img, box.x, box.y, box.w, box.h, (size - w) / 2, (size - h) / 2, w, h)

      return canvas.toDataURL('image/png')
    },
    { src: source, size, pad, box, background: BACKGROUND },
  )
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

for (const target of PNG_TARGETS) {
  const buffer = await render(target.size, target.pad)
  fs.writeFileSync(path.join(OUT, target.file), buffer)
  console.log(`${target.file.padEnd(24)} ${target.size}px  ${(buffer.length / 1024).toFixed(1)} kB`)
}

const icoParts = []
for (const size of ICO_SIZES) {
  icoParts.push({ size, data: await render(size, PADDING.favicon) })
}
const ico = buildIco(icoParts)
fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico)
console.log(`favicon.ico              ${ICO_SIZES.join('/')}px  ${(ico.length / 1024).toFixed(1)} kB`)

// ---------------------------------------------------------------------------
// Social card. 1200×630 is what every scraper crops to, and the copy here has
// to track the home page — a card promising something the page does not say is
// the one kind of staleness nobody notices until it is shared.
const mark = 'data:image/png;base64,' + (await render(512, PADDING.favicon)).toString('base64')

await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: #ffffff; color: #0a0a0a;
    font-family: Figtree, -apple-system, sans-serif;
    padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between;
  }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand img { width: 56px; height: 56px; border-radius: 12px; border: 1px solid #e5e5e5; }
  .brand span { font-size: 30px; font-weight: 700; letter-spacing: -0.01em; }
  .domain { font-size: 22px; color: #737373; }
  h1 { font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: -0.028em; max-width: 20ch; }
  p { font-size: 27px; line-height: 1.45; color: #525252; max-width: 52ch; margin-top: 24px; }
  .routes { display: flex; gap: 12px; }
  .routes span {
    font-size: 21px; font-weight: 500; color: #262626;
    border: 1px solid #e5e5e5; border-radius: 999px; padding: 10px 22px;
  }
</style></head>
<body>
  <div class="top">
    <div class="brand"><img src="${mark}" alt=""><span>WhichToUse</span></div>
    <div class="domain">whichtouse.com</div>
  </div>
  <div>
    <h1>Compare SaaS, open source and skills — limits first.</h1>
    <p>Leading and emerging picks for every task, so you can choose fast and get back to work.</p>
  </div>
  <div class="routes"><span>SaaS</span><span>Open source</span><span>Skills</span></div>
</body></html>`)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'og.png') })
console.log(`og.png                   1200×630  ${(fs.statSync(path.join(OUT, 'og.png')).size / 1024).toFixed(1)} kB`)

await browser.close()
