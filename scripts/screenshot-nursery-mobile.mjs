import { chromium, devices } from 'playwright'
import { join } from 'path'

const browser = await chromium.launch()
const page    = await browser.newPage({ ...devices['iPhone 14'] })

await page.goto('https://trk-agriculture.netlify.app/pepiniere', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const out = join(process.cwd(), 'scripts', 'nursery-mobile.png')
await page.screenshot({ path: out, fullPage: true })
console.log('Saved:', out)

await browser.close()
