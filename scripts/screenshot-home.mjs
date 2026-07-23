import { chromium } from 'playwright'
import { join } from 'path'

const browser = await chromium.launch()
const page    = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

await page.goto('https://trk-agriculture.netlify.app', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const out = join(process.cwd(), 'scripts', 'home-full.png')
await page.screenshot({ path: out, fullPage: true })
console.log('Saved:', out)

await browser.close()
