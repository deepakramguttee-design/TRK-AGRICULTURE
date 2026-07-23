import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'
const TEST_EMAIL = 'googleplaytest@trk-agriculture.app'
const TEST_PASSWORD = 'TrkDemo2026!'
const TEST_NAME = 'Google Test'

const browser = await chromium.launch({ headless: false, slowMo: 250 })
const page = await browser.newPage()

console.log('\n=== 1. ROUTES PUBLIQUES (anonyme) ===\n')

const publicRoutes = [
  ['/', 'Accueil'],
  ['/catalogue', 'Catalogue'],
  ['/produit/EPI-004', 'Fiche produit'],
  ['/panier', 'Panier'],
  ['/commande', 'Commande (checkout)'],
  ['/compte', 'Mon compte'],
  ['/login', 'Login/Inscription'],
]

for (const [route, label] of publicRoutes) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 })
  const final = page.url()
  const redirected = !final.includes(route)
  console.log(`${redirected ? '🔒' : '🌐'} ${label.padEnd(25)} → ${final}`)
}

console.log('\n=== 2. AJOUT PANIER SANS COMPTE ===\n')
await page.goto(`${BASE}/produit/EPI-004`, { waitUntil: 'networkidle' })
const addBtn = page.getByRole('button', { name: /panier|ajouter|add/i }).first()
const canAdd = await addBtn.isVisible().catch(() => false)
if (canAdd) {
  await addBtn.click()
  await page.waitForTimeout(1000)
  const afterAdd = page.url()
  console.log('Ajout panier sans login:', afterAdd.includes('/login') ? '🔒 Redirigé vers login' : '✅ OK sans compte (URL: ' + afterAdd + ')')
} else {
  console.log('Bouton panier non trouvé sur cette fiche')
}

console.log('\n=== 3. CHECKOUT SANS COMPTE ===\n')
await page.goto(`${BASE}/commande`, { waitUntil: 'networkidle' })
const checkoutURL = page.url()
console.log('Checkout page:', checkoutURL.includes('/login') ? '🔒 Redirigé vers login' : '🌐 Accessible (' + checkoutURL + ')')
await page.screenshot({ path: 'scripts/appaccess-checkout.png' })

console.log('\n=== 4. CRÉATION COMPTE TEST ===\n')
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
// Cliquer sur l'onglet Inscription
const regTab = page.getByRole('button', { name: /inscription|register|créer/i })
  .or(page.getByText(/inscription|s'inscrire/i)).first()
const hasRegTab = await regTab.isVisible().catch(() => false)
console.log('Onglet inscription:', hasRegTab ? 'trouvé' : 'non trouvé')
if (hasRegTab) {
  await regTab.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'scripts/appaccess-register.png' })
}

// Remplir le formulaire d'inscription
const nameInput = page.getByPlaceholder(/nom|name/i).first()
const phoneInput = page.getByPlaceholder(/téléphone|phone|07/i).first()
const emailInput = page.getByPlaceholder(/email/i).last()
const passInput = page.getByPlaceholder(/mot de passe|password/i).first()
const confirmInput = page.getByPlaceholder(/confirmer|confirm/i).first()

await nameInput.fill(TEST_NAME).catch(() => {})
await phoneInput.fill('57123456').catch(() => {})
await emailInput.fill(TEST_EMAIL).catch(() => {})
await passInput.fill(TEST_PASSWORD).catch(() => {})
await confirmInput.fill(TEST_PASSWORD).catch(() => {})

await page.screenshot({ path: 'scripts/appaccess-register-filled.png' })

const submitBtn = page.getByRole('button', { name: /créer|inscription|register|s'inscrire/i }).last()
await submitBtn.click().catch(() => {})
await page.waitForTimeout(3000)
await page.screenshot({ path: 'scripts/appaccess-after-register.png' })
const afterRegister = page.url()
console.log('Après inscription:', afterRegister)
const toast = await page.locator('[data-state="open"]').textContent().catch(() => '')
console.log('Message:', toast || '(aucun toast visible)')

console.log('\n=== 5. CONNEXION COMPTE TEST ===\n')
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.getByPlaceholder(/email/i).first().fill(TEST_EMAIL)
await page.getByPlaceholder(/mot de passe|password/i).first().fill(TEST_PASSWORD)
await page.getByRole('button', { name: /connexion|se connecter|login/i }).first().click()
await page.waitForTimeout(3000)
await page.screenshot({ path: 'scripts/appaccess-logged-in.png' })
console.log('Après login:', page.url())

await browser.close()
console.log('\nScreenshots: scripts/appaccess-*.png')
