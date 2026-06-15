import { chromium } from 'playwright'

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const BASE           = 'http://localhost:5174'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Usage: ADMIN_EMAIL=x ADMIN_PASSWORD=y node scripts/test-employee-creation.mjs')
  process.exit(1)
}

const browser = await chromium.launch({ headless: false, slowMo: 400 })
const page    = await browser.newPage()

// Intercepter les logs browser et les réponses réseau
page.on('console', msg => { if (msg.type() === 'error') console.log('[browser error]', msg.text()) })
page.on('response', async res => {
  if (res.url().includes('create-team-member') || res.url().includes('functions')) {
    let body = ''
    try { body = await res.text() } catch {}
    console.log(`[edge fn] ${res.status()} ${res.url().split('/').pop()} →`, body.slice(0, 300))
  }
})

// 1. Admin login
console.log('→ Opening admin login page...')
await page.goto(`${BASE}/admin/login`)
await page.screenshot({ path: 'scripts/ss-01-admin-login.png' })

await page.fill('#email', ADMIN_EMAIL)
await page.fill('#password', ADMIN_PASSWORD)

// Test the eye toggle
console.log('→ Testing password visibility toggle...')
await page.click('button[tabindex="-1"]')
await page.screenshot({ path: 'scripts/ss-02-password-visible.png' })
await page.click('button[tabindex="-1"]')

await page.click('button[type="submit"]')
await page.waitForURL(`${BASE}/admin`, { timeout: 10000 })
console.log('✓ Admin logged in')
await page.screenshot({ path: 'scripts/ss-03-dashboard.png' })

// 2. Go to users > equipe tab
await page.goto(`${BASE}/admin/utilisateurs`)
await page.waitForLoadState('networkidle')
await page.getByRole('button', { name: /Équipe/ }).click()
await page.screenshot({ path: 'scripts/ss-04-team-before.png' })

// 3. Open invite modal
await page.getByText('Ajouter un membre').click()
await page.screenshot({ path: 'scripts/ss-05-modal-open.png' })

// 4. Fill form
const ts = Date.now()
const empEmail = `employe.test.${ts}@trk-agriculture.mu`
await page.getByPlaceholder('Prénom Nom').fill('Test Employe')
await page.getByPlaceholder('email@exemple.com').fill(empEmail)
await page.getByPlaceholder('Min. 8 caractères').fill('testpass123')
// role stays 'employe' by default

await page.screenshot({ path: 'scripts/ss-06-modal-filled.png' })

// 5. Submit
await page.getByRole('button', { name: 'Créer le compte' }).click()

// Attendre que le modal disparaisse (max 15s) ou capturer l'état d'erreur
const modalOverlay = page.locator('.fixed.inset-0.bg-black\\/40')
try {
  await modalOverlay.waitFor({ state: 'hidden', timeout: 15000 })
  console.log('✓ Modal fermé — création réussie')
} catch {
  // Modal encore ouvert = erreur affichée
  await page.screenshot({ path: 'scripts/ss-07-error-state.png' })
  const toastText = await page.locator('[data-state="open"]').textContent().catch(() => '')
  console.log('✗ Modal toujours ouvert après 15s')
  console.log('  Toast visible:', toastText || '(aucun)')
  await browser.close()
  process.exit(1)
}
await page.screenshot({ path: 'scripts/ss-07-after-submit.png' })

// 6. Verify employee appears in team tab
await page.getByRole('button', { name: /Équipe/ }).click()
await page.waitForLoadState('networkidle')
await page.screenshot({ path: 'scripts/ss-08-team-after.png' })

const found = await page.getByText('Test Employe').isVisible().catch(() => false)
console.log(found ? '✓ Employé visible dans l\'onglet Équipe' : '✗ Employé NON trouvé dans l\'onglet Équipe')

// 7. Verify admin session is still active (not logged out)
const url = page.url()
console.log(url.includes('/admin') ? '✓ Session admin préservée' : `✗ Session perdue — URL: ${url}`)

await browser.close()
console.log('Screenshots saved in scripts/')
