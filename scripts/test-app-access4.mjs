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

// Cliquer "Créer un compte"
await page.getByRole('button', { name: 'Créer un compte' }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: 'scripts/appaccess-register-tab.png' })

// Remplir le formulaire
await page.getByPlaceholder('Jean Dupont').fill(TEST_NAME)
await page.getByPlaceholder(/5[0-9]{7}|téléphone|phone/i).first().fill('57123456')
await page.getByPlaceholder('vous@exemple.com').fill(TEST_EMAIL)

// Mots de passe (le formulaire register a 2 champs password)
const pwdInputs = page.locator('input[type="password"]')
await pwdInputs.nth(0).fill(TEST_PASSWORD)
await pwdInputs.nth(1).fill(TEST_PASSWORD)

await page.screenshot({ path: 'scripts/appaccess-register-filled.png' })

// Soumettre
await page.getByRole('button', { name: /créer mon compte|créer le compte|s'inscrire/i }).click()
await page.waitForTimeout(4000)
await page.screenshot({ path: 'scripts/appaccess-after-register.png' })
const afterReg = page.url()
const toast = await page.locator('[data-state="open"]').textContent().catch(() => '')
console.log('URL après inscription:', afterReg)
console.log('Toast:', toast || '(aucun)')

// ── Vérifier si on est connecté ─────────────────────────────
if (afterReg.includes('/compte')) {
  console.log('✅ Inscription + login automatique OK → /compte')
} else {
  console.log('→ Tentative de login direct...')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder('vous@exemple.com').fill(TEST_EMAIL)
  const loginPwd = page.locator('input[type="password"]').first()
  await loginPwd.fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /se connecter|connexion/i }).click()
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'scripts/appaccess-login-result.png' })
  console.log('URL après login:', page.url())
  const toast2 = await page.locator('[data-state="open"]').textContent().catch(() => '')
  if (toast2) console.log('Toast login:', toast2)
}

// ── Commande COD ─────────────────────────────────────────────
console.log('\n=== TEST COMMANDE COD ===\n')
// Ajouter un produit au panier
await page.goto(`${BASE}/produit/EPI-004`, { waitUntil: 'networkidle' })
const addBtn = page.getByRole('button', { name: /panier|ajouter/i }).first()
await addBtn.click().catch(() => {})
await page.waitForTimeout(1000)

// Aller au checkout
await page.goto(`${BASE}/commande`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-checkout-form.png' })
console.log('Checkout accessible:', page.url())

// Remplir le formulaire commande
await page.getByPlaceholder(/nom|name/i).first().fill('Google Test').catch(() => {})
await page.getByPlaceholder(/5[0-9]{7}|téléphone/i).first().fill('57123456').catch(() => {})
await page.getByPlaceholder(/email/i).first().fill(TEST_EMAIL).catch(() => {})

// Sélectionner un district
const districtSelect = page.getByRole('combobox').first()
const hasDistrict = await districtSelect.isVisible().catch(() => false)
if (hasDistrict) {
  await districtSelect.click()
  await page.waitForTimeout(300)
  await page.getByRole('option').first().click().catch(() => {})
}
await page.getByPlaceholder(/adresse|address/i).first().fill('Lot 5, Rivière Noire').catch(() => {})
await page.screenshot({ path: 'scripts/appaccess-checkout-filled.png' })

// Vérifier mode paiement COD disponible
const codLabel = page.getByText(/espèces|cash|livraison|cod/i).first()
const hasCOD = await codLabel.isVisible().catch(() => false)
console.log('Mode COD disponible:', hasCOD ? 'OUI ✅' : 'NON')

await browser.close()
console.log('\nScreenshots: scripts/appaccess-*.png')
