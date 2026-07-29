// Live-site audit. Walks the real product paths a visitor takes, on desktop and
// phone, and reports anything that breaks, errors, or reads wrong.
import { chromium, devices } from 'playwright-core'

const BASE = process.env.BASE ?? 'https://whichtouse.com'
const OUT = process.env.OUT ?? '.'

const findings = []
const note = (sev, area, msg, extra) =>
  findings.push({ sev, area, msg, ...(extra ? { extra } : {}) })

async function probe(ctx, label, path, shots) {
  const page = await ctx.newPage()
  const consoleErrors = []
  const pageErrors = []
  const failed = []
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)))
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)))
  page.on('requestfailed', (r) => failed.push(`${r.url().slice(0, 90)} ${r.failure()?.errorText}`))
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 90)}`)
  })

  const t0 = Date.now()
  let status = 'ERR'
  try {
    const resp = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 })
    status = resp?.status()
    await page.waitForTimeout(2500)
  } catch (e) {
    note('P0', label, `navigation failed: ${e.message.slice(0, 120)}`)
    await page.close()
    return null
  }
  const ms = Date.now() - t0

  if (status >= 400) note('P0', label, `HTTP ${status} on ${path}`)
  for (const e of pageErrors) note('P0', label, `uncaught error: ${e}`)
  for (const e of consoleErrors.slice(0, 4)) note('P1', label, `console error: ${e}`)
  for (const f of [...new Set(failed)].slice(0, 6)) note('P1', label, `request failed: ${f}`)

  // horizontal overflow — the classic mobile killer
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 2)
      .slice(0, 5)
      .map((el) => `${el.tagName}.${(el.className || '').toString().slice(0, 40)}`)
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, wide }
  })
  if (overflow.scrollW > overflow.clientW + 2) {
    note('P1', label, `horizontal overflow ${overflow.scrollW}>${overflow.clientW}`, overflow.wide)
  }

  // empty / placeholder content
  const text = await page.evaluate(() => document.body.innerText)
  for (const bad of ['undefined', 'null,', 'NaN', '[object Object]', 'No solid picks yet']) {
    if (text.includes(bad)) note('P1', label, `placeholder text on page: "${bad}"`)
  }
  if (text.trim().length < 300) note('P0', label, `page nearly empty (${text.trim().length} chars)`)

  // tap targets
  const small = await page.evaluate(() => {
    return [...document.querySelectorAll('a,button,[role=button]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32)
      })
      .slice(0, 6)
      .map((el) => `${el.tagName} "${(el.innerText || el.ariaLabel || '').slice(0, 24)}"`)
  })
  if (small.length) note('P2', label, `${small.length}+ small tap targets`, small)

  if (shots) await page.screenshot({ path: `${OUT}/${shots}.png`, fullPage: false })
  const result = { label, path, status, ms, text }
  await page.close()
  return result
}

const browser = await chromium.launch()

// ---- desktop ----
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const home = await probe(desktop, 'desktop/home', '/', 'd-home')
if (home && home.ms > 6000) note('P1', 'desktop/home', `slow first load ${home.ms}ms`)

const cat = await probe(desktop, 'desktop/category', '/c/coding', 'd-cat')

// interaction: does clicking a row open the detail panel?
{
  const page = await desktop.newPage()
  await page.goto(BASE + '/c/coding', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const before = await page.evaluate(() => document.body.innerText.length)
  const row = page.locator('text=Claude Code').first()
  try {
    await row.click({ timeout: 8000 })
    await page.waitForTimeout(1800)
    const after = await page.evaluate(() => document.body.innerText.length)
    if (after <= before + 100) note('P0', 'desktop/detail', 'clicking a ranking row did not open a detail panel')
    else {
      const panel = await page.evaluate(() => document.body.innerText)
      for (const want of ['Pricing', 'pricing', 'Sources', 'source'])
        if (!panel.includes(want)) note('P2', 'desktop/detail', `detail panel missing "${want}"`)
    }
    await page.screenshot({ path: `${OUT}/d-detail.png` })
  } catch (e) {
    note('P0', 'desktop/detail', `row not clickable: ${e.message.slice(0, 100)}`)
  }
  await page.close()
}

// 404 behaviour
{
  const page = await desktop.newPage()
  const r = await page.goto(BASE + '/c/does-not-exist', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  const t = await page.evaluate(() => document.body.innerText)
  if (r?.status() === 200 && t.trim().length < 200)
    note('P1', 'desktop/404', 'unknown category returns a blank 200 page')
  await page.screenshot({ path: `${OUT}/d-404.png` })
  await page.close()
}

// ---- mobile ----
const phone = await browser.newContext({ ...devices['iPhone 13'] })
await probe(phone, 'mobile/home', '/', 'm-home')
await probe(phone, 'mobile/category', '/c/coding', 'm-cat')

// SEO / share surface
{
  const page = await desktop.newPage()
  await page.goto(BASE + '/c/coding', { waitUntil: 'domcontentloaded' })
  const meta = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    h1: [...document.querySelectorAll('h1')].map((h) => h.innerText),
  }))
  if (!meta.canonical) note('P2', 'seo', 'no canonical link on category page')
  if (meta.h1.length !== 1) note('P2', 'seo', `h1 count = ${meta.h1.length}`, meta.h1)
  console.log('META', JSON.stringify(meta, null, 1))
  await page.close()
}

await browser.close()

findings.sort((a, b) => a.sev.localeCompare(b.sev))
console.log('\n=== FINDINGS ===')
for (const f of findings) {
  console.log(`${f.sev} [${f.area}] ${f.msg}`)
  if (f.extra) console.log('     ', JSON.stringify(f.extra).slice(0, 220))
}
console.log(`\ntotal: ${findings.length}`)
