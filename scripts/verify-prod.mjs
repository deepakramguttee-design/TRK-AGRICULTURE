import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'https://trk-agriculture.netlify.app';
const OUT = 'C:/Users/Deepak RAMGUTTEE/trk-agriculture/scripts';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const results = [];

const check = (label, ok, detail = '') => {
  results.push({ label, ok, detail });
  console.log((ok ? '✅' : '❌') + ' ' + label + (detail ? ' — ' + detail : ''));
};

// 1. Accueil
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
const title = await page.title();
check('Accueil charge', !title.includes('Error'), title);
await page.screenshot({ path: OUT + '/verify-01-home.png' });

// 2. Footer — Facebook + WhatsApp
const fbHref = await page.$eval('a[aria-label*="Facebook"]', el => el.href).catch(() => 'NOT FOUND');
const waHref = await page.$eval('a[aria-label*="WhatsApp"]', el => el.href).catch(() => 'NOT FOUND');
check('Facebook = dipraj.ramguttee', fbHref.includes('dipraj.ramguttee'), fbHref);
check('WhatsApp = 23057745306', waHref.includes('23057745306'), waHref);
await page.screenshot({ path: OUT + '/verify-02-footer.png', fullPage: true });

// 3. Catalogue
await page.goto(BASE + '/catalogue', { waitUntil: 'networkidle', timeout: 30000 });
const cardCount = await page.$$eval('[class*="product"], [class*="card"], article', els => els.length);
check('Catalogue charge', cardCount > 0, cardCount + ' éléments');

const localImgs = await page.$$eval('img', imgs => imgs.filter(i => i.src.includes('/products/') && i.naturalWidth > 0).length);
check('Images /products/ visibles', localImgs > 0, localImgs + ' images chargées');
await page.screenshot({ path: OUT + '/verify-03-catalog.png' });

// 4. Page produit
await page.goto(BASE + '/produit/LEG-005', { waitUntil: 'networkidle', timeout: 20000 });
const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');
check('Page produit charge (h1)', h1.length > 0, h1);
await page.screenshot({ path: OUT + '/verify-04-product.png' });

// 5. Ajouter au panier
const addBtn = page.locator('button:has-text("Panier"), button:has-text("Ajouter"), button:has-text("Add to"), button:has-text("panier")').first();
const btnExists = await addBtn.count() > 0;
if (btnExists) {
  await addBtn.click();
  await page.waitForTimeout(1000);
  check('Ajout au panier', true, 'bouton cliqué');
} else {
  check('Ajout au panier', false, 'bouton non trouvé');
}

// 6. Page panier
await page.goto(BASE + '/panier', { waitUntil: 'networkidle', timeout: 20000 });
const cartText = await page.textContent('main').catch(() => '');
check('Page panier charge', cartText.length > 50, cartText.substring(0,80).trim());
await page.screenshot({ path: OUT + '/verify-05-cart.png' });

// 7. Page checkout
await page.goto(BASE + '/commande', { waitUntil: 'networkidle', timeout: 20000 });
const checkText = await page.textContent('main').catch(() => '');
check('Page checkout charge', checkText.length > 50, checkText.substring(0,80).trim());
await page.screenshot({ path: OUT + '/verify-06-checkout.png' });

await browser.close();

const pass = results.every(r => r.ok);
const passed = results.filter(r => r.ok).length;
console.log('\n' + (pass ? '🟢 PASS' : '🔴 FAIL') + ' — ' + passed + '/' + results.length + ' checks');