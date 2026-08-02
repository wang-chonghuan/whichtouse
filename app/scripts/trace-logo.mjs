#!/usr/bin/env node
// One-off: turns the raster logo into a vector we own.
//
//   node scripts/trace-logo.mjs
//
// resources/wtu-logo.png is a 1254² bitmap, so every icon derived
// from it was a downscale of a downscale and its three colours were baked in —
// recolouring meant editing pixels. This traces each letter's colour region
// into paths, writes resources/brand/wtu-logo.svg, and from then on the mark is
// resolution-free and its palette is three fill attributes.
//
// Tracing runs in Playwright's Chromium for the same reason gen-icons.mjs does:
// canvas gives pixel access without adding an image library to the toolchain.
// It is a one-off — the SVG is committed, and this script exists so the next
// person can see how it was produced rather than having to trust it.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(here, '../../resources/wtu-logo.png')
const OUT = path.join(here, '../../resources/brand/wtu-logo.svg')

// The letters as they are drawn in the source, and the colour each one keeps.
//
// These are the mark's own colours, sampled out of the source file — not the
// interface palette. The two were briefly the same thing: the mark was
// recoloured to indigo/green/coral so it would match the app, and the result
// was a worse logo. A mark earns its colours from its own balance (green 2.63
// and orange 2.67 on white are within a hair of each other, which is why the
// three read as one object) and it should not move every time the interface
// does. Interface colour lives in src/theme/wtuTheme.ts; this is the brand.
const LETTERS = [
  { id: 'w', source: [0x01, 0x64, 0xe5], fill: '#0164E5', label: 'W · blue' },
  { id: 't', source: [0x60, 0xb3, 0x33], fill: '#60B333', label: 'T · green' },
  { id: 'u', source: [0xfe, 0x77, 0x01], fill: '#FE7701', label: 'U · orange' },
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('about:blank')

const source = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64')

const traced = await page.evaluate(
  async ({ src, letters }) => {
    const img = new Image()
    img.src = src
    await img.decode()
    const W = img.width
    const H = img.height
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, W, H).data

    // Every pixel goes to whichever reference colour it is closest to, with the
    // paper as a fourth candidate. Anti-aliased edge pixels land on one side or
    // the other, which is what makes the mask binary and the trace clean.
    const refs = letters.map((l) => l.source)
    const paper = [253, 254, 254]
    const owner = new Int8Array(W * H).fill(-1)
    for (let i = 0, p = 0; i < px.length; i += 4, p++) {
      const r = px[i]
      const g = px[i + 1]
      const b = px[i + 2]
      let best = -1
      let bestD = (r - paper[0]) ** 2 + (g - paper[1]) ** 2 + (b - paper[2]) ** 2
      for (let k = 0; k < refs.length; k++) {
        const d = (r - refs[k][0]) ** 2 + (g - refs[k][1]) ** 2 + (b - refs[k][2]) ** 2
        if (d < bestD) {
          bestD = d
          best = k
        }
      }
      owner[p] = best
    }

    // Marching squares over the binary mask. Every closed contour is emitted,
    // outer boundaries and holes alike, and the SVG uses fill-rule="evenodd" so
    // holes subtract without having to work out which is which.
    const contoursFor = (k) => {
      const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : owner[y * W + x] === k ? 1 : 0)
      const segs = new Map() // "x,y" -> [x,y] of the segment end
      const key = (x, y) => `${x},${y}`
      for (let y = 0; y <= H; y++) {
        for (let x = 0; x <= W; x++) {
          const tl = at(x - 1, y - 1)
          const tr = at(x, y - 1)
          const br = at(x, y)
          const bl = at(x - 1, y)
          const code = (tl << 3) | (tr << 2) | (br << 1) | bl
          if (code === 0 || code === 15) continue
          const N = [x, y - 0.5]
          const E = [x + 0.5, y]
          const S = [x, y + 0.5]
          const Wp = [x - 0.5, y]
          // Contours run clockwise around filled area; the saddle cases (5, 10)
          // are split the same way every time so the loops always close.
          const add = (a, b) => segs.set(key(a[0], a[1]), b)
          switch (code) {
            case 1: add(S, Wp); break
            case 2: add(E, S); break
            case 3: add(E, Wp); break
            case 4: add(N, E); break
            case 5: add(N, Wp); add(S, E); break
            case 6: add(N, S); break
            case 7: add(N, Wp); break
            case 8: add(Wp, N); break
            case 9: add(S, N); break
            case 10: add(Wp, S); add(E, N); break
            case 11: add(E, N); break
            case 12: add(Wp, E); break
            case 13: add(S, E); break
            case 14: add(Wp, S); break
          }
        }
      }

      const loops = []
      while (segs.size) {
        const startKey = segs.keys().next().value
        const loop = []
        let k2 = startKey
        while (segs.has(k2)) {
          const [sx, sy] = k2.split(',').map(Number)
          loop.push([sx, sy])
          const next = segs.get(k2)
          segs.delete(k2)
          k2 = key(next[0], next[1])
        }
        if (loop.length > 8) loops.push(loop)
      }
      return loops
    }

    // Ramer–Douglas–Peucker. The mark is straight-edged apart from the U's bowl,
    // so a tolerance of about a pixel drops thousands of collinear staircase
    // points without visibly rounding a corner.
    const rdp = (pts, eps) => {
      if (pts.length < 3) return pts
      let maxD = 0
      let idx = 0
      const [ax, ay] = pts[0]
      const [bx, by] = pts[pts.length - 1]
      const dx = bx - ax
      const dy = by - ay
      const len = Math.hypot(dx, dy) || 1
      for (let i = 1; i < pts.length - 1; i++) {
        const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len
        if (d > maxD) {
          maxD = d
          idx = i
        }
      }
      if (maxD <= eps) return [pts[0], pts[pts.length - 1]]
      return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)]
    }

    // Crop to what is actually inked, so the viewBox is the mark and not the
    // source file's generous margins.
    let minX = W
    let minY = H
    let maxX = 0
    let maxY = 0
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (owner[y * W + x] >= 0) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    const out = []
    for (let k = 0; k < letters.length; k++) {
      const loops = contoursFor(k)
        .map((l) => rdp(l, 1.1))
        .filter((l) => l.length > 3)
      const d = loops
        .map(
          (l) =>
            'M' +
            l
              .map(([x, y]) => `${(x - minX).toFixed(1)},${(y - minY).toFixed(1)}`)
              .join('L') +
            'Z',
        )
        .join('')
      out.push({ id: letters[k].id, d, loops: loops.length, points: loops.reduce((n, l) => n + l.length, 0) })
    }
    return { out, box: { w: maxX - minX + 1, h: maxY - minY + 1 } }
  },
  { src: source, letters: LETTERS.map(({ id, source: s }) => ({ id, source: s })) },
)

await browser.close()

const { out, box } = traced
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.w} ${box.h}" fill-rule="evenodd" role="img" aria-label="WhichToUse">
  <title>WhichToUse</title>
${LETTERS.map((l, i) => `  <!-- ${l.label} -->\n  <path id="wtu-${l.id}" fill="${l.fill}" d="${out[i].d}"/>`).join('\n')}
</svg>
`

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, svg)

console.log(`viewBox 0 0 ${box.w} ${box.h}`)
for (const o of out) console.log(`  ${o.id}  ${o.loops} contour(s), ${o.points} points`)
console.log(`-> ${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} kB`)
