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

// Displayed at 44px tall (see `Wordmark` in src/components/bits.tsx).
//
// It began at 34, chosen to sit beside the square WTU mark: bigger than the nav
// labels' cap height because a script loses its joins before an upright face
// loses its stems, but still deferring to the tile next to it. The tile is gone
// and the wordmark is the whole brand in the bar now, so it takes the room the
// tile was using. 44 is the size at which it anchors the bar's left end by
// itself rather than floating in it.
const HEIGHT = 44

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
//
// Lossy costs a measured 3/255 on the blue: the shipped 2x file reads #4C44E4
// where the recolour asks for #4F46E5. Lossless removes that and doubles the
// file, 9.3 kB to 17.1 kB. It was not worth it — a 1% drift on one channel is
// not visible next to the primary button, and it has been checked against it.
const QUALITY = 0.92

// The master was drawn with two colours: #2A38A4, a navy-leaning royal blue,
// for "Which" and "Use", and #FE553C for "To". Three words come out of it.
//
// Each rule is an HSL *relationship*, not a fill: every pixel in the hue band
// takes the same hue offset and the same saturation and lightness ratios that
// carry `from` to `to`. That keeps the letters' dark outline a darkened version
// of the new colour and keeps the bloom's falloff intact — flooding the matched
// pixels with one flat value would erase both.
//
// Order matters, and the rules are applied in the order written. "Use" is
// recoloured out of the blue band first; teal sits at hue 175 and so is no
// longer in that band when the general blue rule runs over the whole image.
//
// `xFrom` is what separates two words painted in one colour. The blue ink has a
// clean 163px vertical gap between x=790 and x=952 — that is the width of the
// coral "To" standing between them — so a cut anywhere inside it splits "Which"
// from "Use" without touching a letter. 871 is the middle of that gap, the
// furthest a cut can be from either word. Measured from the master; if the
// master is ever redrawn, re-measure rather than nudging this number.
const SPLIT_X = 871
const RECOLOUR = [
  // "Use" in teal. #0E6E66 is the prototype's own deep teal — the brand colour
  // of scheme A, "Deep teal on cool paper" — not a hue invented here.
  { from: '#2A38A4', to: '#0E6E66', hueBand: [200, 280], xFrom: SPLIT_X },
  // "Which" onto the interface primary. Two indigos as close as #2A38A4 and
  // #4F46E5 read as a mistake rather than as two decisions, and a near-miss is
  // worse than either a match or a clear contrast.
  //
  // This is the one place the logo follows the palette, and it is deliberate:
  // re-point the primary and the wordmark has to be re-cut with it.
  { from: '#2A38A4', to: '#4F46E5', hueBand: [200, 280] },
  // "To" is left alone. It is the neon in a neon sign and is meant to run
  // hotter than the interface's #D4553C limits colour, which has to sit under
  // body text.
]

const browser = await chromium.launch()
const page = await browser.newPage()

const rendered = await page.evaluate(
  async ({ src, margin, height, densities, quality, recolour }) => {
    const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const l = (max + min) / 2
      const d = max - min
      if (d === 0) return [0, 0, l]
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      let h
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      else if (max === g) h = ((b - r) / d + 2) / 6
      else h = ((r - g) / d + 4) / 6
      return [h * 360, s, l]
    }
    const hslToRgb = (h, s, l) => {
      h = ((h % 360) + 360) % 360 / 360
      if (s === 0) return [l * 255, l * 255, l * 255]
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      const chan = (t) => {
        t = (t + 1) % 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      return [chan(h + 1 / 3) * 255, chan(h) * 255, chan(h - 1 / 3) * 255]
    }
    const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

    const img = new Image()
    img.src = src
    await img.decode()

    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const frame = ctx.getImageData(0, 0, c.width, c.height)
    const data = frame.data

    // Each rule shifts one hue band onto a named colour. The offsets are
    // measured between the two named colours, then applied to every pixel the
    // rule matches, so shading and bloom keep their relationships instead of
    // being flattened.
    const touched = []
    for (const rule of recolour) {
      const from = rgbToHsl(...parse(rule.from))
      const to = rgbToHsl(...parse(rule.to))
      const hueShift = to[0] - from[0]
      const satScale = to[1] / from[1]
      const lightScale = to[2] / from[2]
      let n = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue
        if (rule.xFrom != null && (i / 4) % c.width < rule.xFrom) continue
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
        // Hue is meaningless on a near-grey pixel and rotating one produces a
        // coloured speck, so the band check is guarded by a saturation floor.
        if (s < 0.1 || h < rule.hueBand[0] || h > rule.hueBand[1]) continue
        const [r, g, b] = hslToRgb(
          h + hueShift,
          Math.min(1, s * satScale),
          Math.min(1, l * lightScale),
        )
        data[i] = Math.round(r)
        data[i + 1] = Math.round(g)
        data[i + 2] = Math.round(b)
        n++
      }
      touched.push({ to: rule.to, n })
    }
    ctx.putImageData(frame, 0, 0)

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
      touched,
      // Resampled from the recoloured canvas, not from the original <img>:
      // recolouring after the downscale would work on pixels that already
      // blend blue into coral along the join between the two words.
      files: densities.map((d) => {
        const w = baseWidth * d
        const h = height * d
        const out = document.createElement('canvas')
        out.width = w
        out.height = h
        const octx = out.getContext('2d')
        octx.imageSmoothingQuality = 'high'
        octx.drawImage(c, box.x, box.y, box.w, box.h, 0, 0, w, h)
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
    recolour: RECOLOUR,
  },
)

await browser.close()

console.log(`ink ${rendered.ink.w}x${rendered.ink.h} at ${rendered.ink.x},${rendered.ink.y}`)
console.log(`crop ${rendered.box.w}x${rendered.box.h}`)
for (const step of rendered.touched) {
  console.log(`recolour -> ${step.to}  ${step.n} px`)
}
for (const file of rendered.files) {
  const name = `wordmark-${file.w}.webp`
  const bytes = Buffer.from(file.url.split(',')[1], 'base64')
  fs.writeFileSync(path.join(OUT, name), bytes)
  console.log(`${name}  ${file.w}x${file.h}  ${(bytes.length / 1024).toFixed(1)} kB`)
}
