import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'
const TEST_EMAIL = 'googleplaytest@trk-agriculture.app'
const TEST_PASSWORD = 'TrkDemo2026!'
const TEST_NAME = 'Google Test'

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const context = await browser.newContext()
const page = await context.newPage()

// 1. Page d'accueil
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-01-home.png' })
console.log('1. Accueil:', page.url())

// 2. Catalogue — vérifier qu'il y a des produits
await page.goto(`${BASE}/catalogue`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-02-catalogue.png' })
const produits = await page.locator('[href*="/produit/"]').count()
console.log('2. Catalogue:', produits, 'liens produit visibles')

// 3. Cliquer sur un produit
if (produits > 0) {
  await page.locator('[href*="/produit/"]').first().click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'scripts/appaccess-03-produit.png' })
  console.log('3. Fiche produit:', page.url())

  // Essayer d'ajouter au panier
  const addBtn = page.getByRole('button', { name: /panier|ajouter|cart/i }).first()
  const hasAdd = await addBtn.isVisible().catch(() => false)
  if (hasAdd) {
    await addBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'scripts/appaccess-04-add-cart.png' })
    const loginRequired = page.url().includes('/login')
    console.log('4. Ajout panier → redirection login:', loginRequired ? 'OUI (login requis)' : 'NON (sans compte ok)')
  } else {
    console.log('4. Bouton "Ajouter au panier" non trouvé')
  }
}

// 5. Page panier
await page.goto(`${BASE}/panier`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-05-panier.png' })
console.log('5. Panier URL:', page.url(), '| Redirigé:', page.url().includes('/login'))

// 6. Page checkout
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-06-checkout.png' })
console.log('6. Checkout URL:', page.url(), '| Redirigé:', page.url().includes('/login'))

// 7. Trouver le flux d'inscription
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/appaccess-07-login.png' })
const inscriptionLink = page.getByRole('link', { name: /inscription|créer|register|signup/i })
  .or(page.getByText(/inscription|créer un compte|s'inscrire/i))
const hasInscription = await inscriptionLink.first().isVisible().catch(() => false)
console.log('7. Lien inscription sur /login:', hasInscription ? 'OUI' : 'NON')

if (hasInscription) {
  await inscriptionLink.first().click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'scripts/appaccess-08-signup.png' })
  console.log('8. Page inscription:', page.url())
}

// 8. Essayer de créer le compte test
const currentURL = page.url()
const isSignupPage = currentURL.includes('register') || currentURL.includes('signup') || currentURL.includes('inscription') || currentURL.includes('login')
console.log('→ Page actuelle pour inscription:', currentURL)

await browser.close()
console.log('\nTerminé. Screenshots dans scripts/')
