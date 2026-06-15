import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'
const TEST_EMAIL = 'googleplaytest@trk-agriculture.app'
const TEST_PASSWORD = 'TrkDemo2026!'
const TEST_NAME = 'Google Test'

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const page = await browser.newPage()

// ── Inscription ─────────────────────────────────────────────
console.log('\n=== CRÉATION COMPTE TEST ===\n')
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })

await page.getByRole('button', { name: 'Créer un compte' }).click()
await page.waitForTimeout(500)

await page.getByPlaceholder('Prénom Nom').fill(TEST_NAME)
await page.getByPlaceholder('52 345 678').fill('57123456')
await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)

// Les PasswordInput wrappent les inputs — on les remplit par ordre d'apparition
await page.getByPlaceholder('Min. 6 caractères').fill(TEST_PASSWORD)
// Le champ "Confirmer" a placeholder "••••••••" — attention login aussi, mais register tab est actif
const pwdFields = page.locator('input[type="password"]')
const count = await pwdFields.count()
console.log('Champs password visibles:', count)
if (count >= 2) await pwdFields.nth(1).fill(TEST_PASSWORD)

await page.screenshot({ path: 'scripts/appaccess-filled.png' })

await page.getByRole('button', { name: 'Créer mon compte' }).click()
await page.waitForTimeout(5000)
await page.screenshot({ path: 'scripts/appaccess-after-reg.png' })
const toastMsg = await page.locator('[data-state="open"]').textContent().catch(() => '')
console.log('URL:', page.url())
console.log('Toast:', toastMsg || '(aucun)')

const accountOK = page.url().includes('/compte')
console.log('Compte créé + login auto:', accountOK ? 'OUI ✅' : 'NON (reste sur /login)')

if (!accountOK) {
  // Essayer le login direct
  console.log('\n→ Login direct...')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  // Tab "Se connecter" est actif par défaut
  await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForTimeout(4000)
  await page.screenshot({ path: 'scripts/appaccess-login-result.png' })
  const afterLogin = page.url()
  const toast2 = await page.locator('[data-state="open"]').textContent().catch(() => '')
  console.log('URL après login:', afterLogin)
  if (toast2) console.log('Toast:', toast2)
  console.log('Login OK:', afterLogin.includes('/compte') ? 'OUI ✅' : 'NON ✗')
}

// ── Commande COD ─────────────────────────────────────────────
console.log('\n=== TEST COMMANDE COD ===\n')
await page.goto(`${BASE}/produit/EPI-004`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-produit.png' })
const addBtn = page.getByRole('button', { name: /panier|ajouter/i }).first()
const visible = await addBtn.isVisible().catch(() => false)
console.log('Bouton panier visible:', visible)
if (visible) {
  await addBtn.click()
  await page.waitForTimeout(1200)
  console.log('Produit ajouté au panier, URL:', page.url())
}

await page.goto(`${BASE}/commande`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-checkout.png' })
console.log('Page commande:', page.url())
const hasCOD = await page.getByText(/espèces|livraison|cod|comptant/i).first().isVisible().catch(() => false)
const hasJuice = await page.getByText(/juice|mobile/i).first().isVisible().catch(() => false)
console.log('Mode COD:', hasCOD ? 'OUI ✅' : 'NON')
console.log('Mode Juice/Mobile:', hasJuice ? 'OUI' : 'NON')

await browser.close()
