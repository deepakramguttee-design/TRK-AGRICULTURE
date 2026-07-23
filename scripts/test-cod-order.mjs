import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'

const browser = await chromium.launch({ headless: false, slowMo: 350 })
const page = await browser.newPage()

page.on('response', async res => {
  if (res.url().includes('supabase') && res.status() >= 400) {
    const body = await res.text().catch(() => '')
    console.log(`[supabase ${res.status()}] ${res.url().split('/').slice(-2).join('/')} → ${body.slice(0,200)}`)
  }
})

// 1. Ouvrir la fiche produit et ajouter au panier
console.log('\n=== 1. AJOUT AU PANIER ===\n')
await page.goto(`${BASE}/produit/EPI-004`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/cod-01-product.png' })

const addBtn = page.getByRole('button', { name: 'Add to cart' }).first()
await addBtn.waitFor({ timeout: 8000 })
await addBtn.click()
await page.waitForTimeout(1000)
console.log('Produit ajouté au panier (état React)')

// 2. Naviguer vers /commande via LIEN interne (préserve l'état React)
console.log('\n=== 2. NAVIGATION VERS CHECKOUT ===\n')

// Essayer le lien panier dans le header
const cartLink = page.getByRole('link', { name: /panier|cart/i }).first()
const hasCartLink = await cartLink.isVisible({ timeout: 3000 }).catch(() => false)
if (hasCartLink) {
  await cartLink.click()
  await page.waitForURL(`${BASE}/panier`, { timeout: 8000 }).catch(() => {})
  await page.screenshot({ path: 'scripts/cod-02-cart.png' })
  console.log('Page panier:', page.url())

  // Chercher bouton Commander/Checkout
  const checkoutBtn = page.getByRole('link', { name: /commander|checkout|commande/i })
    .or(page.getByRole('button', { name: /commander|checkout|commande/i }))
    .first()
  const hasCheckout = await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)
  if (hasCheckout) {
    await checkoutBtn.click()
    await page.waitForLoadState('networkidle')
  } else {
    // Naviguer via window.location dans la SPA (préserve l'état)
    await page.evaluate(() => { window.history.pushState({}, '', '/commande'); window.dispatchEvent(new PopStateEvent('popstate')) })
    await page.waitForTimeout(1000)
  }
} else {
  // Forcer navigation SPA via history
  await page.evaluate(() => { window.history.pushState({}, '', '/commande'); window.dispatchEvent(new PopStateEvent('popstate')) })
  await page.waitForTimeout(1000)
}

await page.screenshot({ path: 'scripts/cod-03-checkout.png' })
console.log('URL checkout:', page.url())

// 3. Remplir le formulaire
const formVisible = await page.getByPlaceholder(/John Doe|Jean Dupont/).isVisible({ timeout: 5000 }).catch(() => false)
console.log('Formulaire visible:', formVisible ? 'OUI ✅' : 'NON')

if (formVisible) {
  const namePH = await page.getByPlaceholder(/John Doe|Jean Dupont/).isVisible().then(() => true).catch(() => false)
  const nameField = namePH ? page.getByPlaceholder(/John Doe|Jean Dupont/) : page.getByLabel(/nom/i).first()
  await nameField.fill('Google Test COD')
  await page.getByPlaceholder('52 345 678').fill('57123456')
  await page.getByPlaceholder('email@exemple.mu').fill('googleplaytest@trk-agriculture.app')

  // District
  const districtTrigger = page.getByRole('combobox').first()
  await districtTrigger.click()
  await page.waitForTimeout(400)
  await page.getByRole('option', { name: 'Port Louis' }).click()
  await page.waitForTimeout(300)

  // Adresse
  const addrPH = /Street number|Rue|adresse/i
  await page.getByPlaceholder(addrPH).first().fill('12 Royal Road, Port Louis')

  await page.screenshot({ path: 'scripts/cod-04-filled.png' })
  console.log('Formulaire rempli ✅')

  // 4. Soumettre COD
  console.log('\n=== 3. SOUMISSION COD ===\n')
  const submitBtn = page.getByRole('button', { name: /Confirm order|Confirmer la commande/i })
  await submitBtn.scrollIntoViewIfNeeded()
  await submitBtn.click()
  await page.waitForTimeout(6000)
  await page.screenshot({ path: 'scripts/cod-05-result.png' })

  const finalURL = page.url()
  console.log('URL finale:', finalURL)

  if (finalURL.includes('/commande/confirmee/')) {
    const orderNum = finalURL.split('/').pop()
    console.log(`\n✅ COMMANDE COD CONFIRMÉE — numéro: ${orderNum}`)
    const h = await page.locator('h1, h2').first().textContent().catch(() => '')
    console.log('Page:', h)
  } else {
    const toast = await page.locator('[data-state="open"]').textContent().catch(() => '')
    console.log('✗ Non confirmée. Toast:', toast || '(aucun)')
  }
}

await browser.close()
console.log('\nTerminé. Screenshots: scripts/cod-*.png')
