import { chromium } from 'playwright'

const BASE = 'https://trk-agriculture.netlify.app'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

const results = {}

async function testRoute(route, label) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 })
  const url = page.url()
  const redirected = !url.includes(route) || url.includes('/login') || url.includes('/connexion')
  results[label] = { route, finalUrl: url, redirectedToLogin: url.includes('/login') || url.includes('/connexion') }
  console.log(`${redirected && (url.includes('/login') || url.includes('/connexion')) ? '🔒' : '🌐'} ${label.padEnd(30)} ${route.padEnd(20)} → ${url}`)
}

console.log('\n=== TEST ROUTES ANONYMES ===\n')
await testRoute('/', 'Page accueil')
await testRoute('/catalogue', 'Catalogue')
await testRoute('/produit/1', 'Fiche produit (id 1)')
await testRoute('/panier', 'Panier')
await testRoute('/checkout', 'Checkout')
await testRoute('/commande', 'Commande')
await testRoute('/login', 'Login client')
await testRoute('/admin', 'Admin (protégé)')
await testRoute('/mon-compte', 'Mon compte')

console.log('\n=== TEST INSCRIPTION CLIENT ===\n')
// Trouver la route d'inscription
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 })
await page.screenshot({ path: 'scripts/appaccess-01-login.png' })
const loginHTML = await page.content()
const hasSignup = loginHTML.includes('inscription') || loginHTML.includes('Inscription') || loginHTML.includes('register') || loginHTML.includes('créer')
console.log('Page login - lien inscription:', hasSignup ? 'OUI' : 'NON')
console.log('URL finale login:', page.url())

await browser.close()
console.log('\nScreenshots: scripts/appaccess-*.png')
