#!/usr/bin/env node
// Regenerates every icon and the social card from the one master logo.
//
//   node scripts/gen-icons.mjs
//
// Source of truth: resources/brand/wtu-logo.svg, traced from the original
// bitmap by scripts/trace-logo.mjs. Everything under app/public/ that shows the
// brand is derived here, so a new logo is one file swap and one command rather
// than a hunt through the repo.
//
// Vector source matters at these sizes: every raster is now rasterised straight
// at its target size instead of being downscaled from a 1254px bitmap, so the
// 16px favicon gets hinted edges rather than a blur of a blur. It also means
// recolouring the mark is three fill attributes, not an image edit.
//
// Rendering runs in Playwright's Chromium rather than an image library: the
// project already depends on it, and a browser is the one renderer guaranteed
// to draw the SVG the same way the site will.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(here, '../../resources/brand/wtu-logo.svg')
const OUT = path.join(here, '../public')

// Colours and the font come from the same file the app reads, so a theme swap
// cannot leave the social card and the manifest wearing the previous palette.
// This script is plain node and cannot import the .ts theme, which is exactly
// why brand.json exists as JSON rather than as another TypeScript module.
const brand = JSON.parse(fs.readFileSync(path.join(here, '../src/theme/brand.json'), 'utf8'))

// The SVG's viewBox is already cropped to the ink, so "padding" here is exactly
// what the platform sees — no margin is inherited from the source file.
const PADDING = {
  favicon: 0.06, // tiny sizes: the mark needs the pixels more than it needs air
  touch: 0.1, // iOS rounds the corners itself and adds nothing
  android: 0.1,
  maskable: 0.2, // Android may crop to a circle; keep content in the safe zone
}

// Icons stay on their own opaque tile rather than the theme's canvas: a favicon
// is composited against browser chrome we do not control, and a transparent
// mark inverts unpredictably between light and dark tab bars.
const BACKGROUND = brand.iconBackground

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

const markup = fs.readFileSync(SRC, 'utf8')

/** Rasterises the mark at exactly `size`, centred on an opaque tile with `pad`
 * of the square left clear on each side. Rendering at the target size rather
 * than downscaling is the whole reason for the vector source. */
async function render(size, pad) {
  const inner = Math.round(size * (1 - pad * 2))
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<body style="margin:0;width:${size}px;height:${size}px;background:${BACKGROUND};` +
      `display:grid;place-items:center">` +
      `<div style="width:${inner}px;line-height:0">${markup}</div></body>`,
  )
  return await page.screenshot({ omitBackground: false })
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
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${brand.fontStylesheet}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: ${brand.ogCard.background}; color: ${brand.ogCard.text};
    font-family: ${brand.ogCard.fontFamily};
    padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between;
  }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand .mark { width: 56px; height: 56px; border-radius: 12px; background: ${brand.iconBackground}; display: grid; place-items: center; }
  .brand .mark svg { width: 40px; }
  .brand .word { font-family: "Bricolage Grotesque", ${brand.ogCard.fontFamily}; font-size: 32px; font-weight: 700; letter-spacing: -0.03em; }
  .brand .word .a { color: ${brand.mark.w}; }
  .brand .word .b { color: ${brand.mark.t}; }
  .brand .word .c { color: ${brand.mark.u}; }
  .domain { font-size: 22px; color: ${brand.ogCard.textMuted}; }
  h1 { font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: -0.028em; max-width: 20ch; }
  p { font-size: 27px; line-height: 1.45; color: ${brand.ogCard.textMuted}; max-width: 52ch; margin-top: 24px; }
  .routes { display: flex; gap: 12px; }
  .routes span {
    font-size: 21px; font-weight: 500; color: ${brand.ogCard.text};
    border: 1px solid ${brand.ogCard.border}; border-radius: 999px; padding: 10px 22px;
    background: ${brand.ogCard.surface};
  }
</style></head>
<body>
  <div class="top">
    <div class="brand"><div class="mark">${markup}</div><span class="word"><span class="a">Which</span><span class="b">To</span><span class="c">Use</span></span></div>
    <div class="domain">whichtouse.com</div>
  </div>
  <div>
    <h1>Find the best AI tool for the job — limits first.</h1>
    <p>SaaS, open source and agent skills, side by side. Leading and emerging picks in each.</p>
  </div>
  <div class="routes"><span>SaaS</span><span>Open source</span><span>Agent skills</span></div>
</body></html>`)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'og.png') })
console.log(`og.png                   1200×630  ${(fs.statSync(path.join(OUT, 'og.png')).size / 1024).toFixed(1)} kB`)

// ---------------------------------------------------------------------------
// The manifest is generated rather than hand-kept: two of its fields are theme
// colours, and a hand-edited copy is exactly the file nobody remembers to
// change.
const manifest = {
  name: brand.manifest.name,
  short_name: brand.manifest.shortName,
  description: brand.manifest.description,
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: brand.backgroundBody,
  theme_color: brand.backgroundBody,
  icons: [
    { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`site.webmanifest         theme ${brand.theme}`)

await browser.close()
