import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'

const pass = (msg) => console.log(`  ✅ ${msg}`)
const fail = (msg) => console.log(`  ❌ ${msg}`)
const info = (msg) => console.log(`  ℹ  ${msg}`)

async function check(label, fn) {
  try {
    await fn()
    pass(label)
    return true
  } catch (e) {
    fail(`${label} — ${e.message.split('\n')[0]}`)
    return false
  }
}

const browser = await chromium.launch()
const page    = await browser.newPage()
page.on('console', m => { if (m.type() === 'error') info(`console error: ${m.text().slice(0, 120)}`) })

// ── HOME PAGE ──────────────────────────────────────────────────────────────
console.log('\n🏠  Home page')
await page.goto(BASE, { waitUntil: 'networkidle' })

await check('Hero section renders',    () => page.locator('h1').first().waitFor({ timeout: 5000 }))
await check('Nursery preview section', () => page.getByText(/pépinière en direct|live nursery/i).first().waitFor({ timeout: 5000 }))
await check('Seasons section present', () => page.getByText(/jan.mar|avr.jun/i).first().waitFor({ timeout: 3000 }))
await check('No JS errors in console', async () => {
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.waitForTimeout(500)
  if (errors.length) throw new Error(errors[0])
})

// ── NURSERY PAGE ───────────────────────────────────────────────────────────
console.log('\n🌱  Nursery page (/pepiniere)')
await page.goto(`${BASE}/pepiniere`, { waitUntil: 'networkidle' })

await check('Hero h1 visible',        () => page.locator('h1').first().waitFor({ timeout: 5000 }))
await check('"Live" badge present',   () => page.getByText(/live|en direct/i).first().waitFor({ timeout: 3000 }))

// Filter tabs (only present when batches exist)
const filterBar = await page.getByText(/tous|all/i).first().isVisible().catch(() => false)
if (filterBar) {
  await check('Filter tabs: Tous',    () => page.getByRole('button', { name: /tous|all/i }).first().waitFor())
  await check('Filter tabs: Prêts',   () => page.getByRole('button', { name: /pr.ts|ready/i }).first().waitFor())

  const cards = await page.locator('[class*="rounded-2xl"]').count()
  info(`Batch cards visible: ${cards}`)

  // Click "Prêts" filter
  await page.getByRole('button', { name: /pr.ts|ready/i }).first().click()
  await page.waitForTimeout(300)
  await check('Filter click works (no crash)', () => page.locator('body').waitFor())
} else {
  info('No batches in DB — filter tabs not shown (empty state visible)')
  await check('Empty state message shown', () => page.getByText(/aucun lot|no active/i).first().waitFor({ timeout: 3000 }))
}

await check('Gallery section present', () => page.getByText(/notre pépinière|our nursery/i).first().waitFor({ timeout: 3000 }))
await check('Contact CTA present',     () => page.getByText(/whatsapp/i).first().waitFor({ timeout: 3000 }))

// ── NAVIGATION CHECK ───────────────────────────────────────────────────────
console.log('\n🔗  Navigation')
await page.goto(BASE, { waitUntil: 'networkidle' })
const nurseryLink = page.locator('a[href="/pepiniere"]').first()
await check('Link to /pepiniere on home page', () => nurseryLink.waitFor({ timeout: 3000 }))

await browser.close()
console.log('\n✨  Check complete\n')
