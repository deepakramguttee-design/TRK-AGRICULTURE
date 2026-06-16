import { chromium } from 'playwright';

const BASE = 'https://trk-vitrine.netlify.app';
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
check('Accueil charge', title.includes('TRK'), title);

// 2. Hero — CTA boutique pointe vers trk-agriculture
const heroCta = await page.$eval('a[href*="trk-agriculture"]', el => el.href).catch(() => 'NOT FOUND');
check('Lien boutique correct', heroCta.includes('trk-agriculture.netlify.app'), heroCta);

// 3. WhatsApp footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
const waHref = await page.$eval('a[href*="wa.me"]', el => el.href).catch(() => 'NOT FOUND');
check('WhatsApp = 23057745306', waHref.includes('23057745306'), waHref);

// 4. Page cultures
await page.goto(BASE + '/cultures', { waitUntil: 'networkidle', timeout: 20000 });
const culturesH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');
check('Page cultures charge', culturesH1.length > 0, culturesH1);

// 5. Page B2B
await page.goto(BASE + '/b2b-hotels-restaurants', { waitUntil: 'networkidle', timeout: 20000 });
const b2bH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');
check('Page B2B charge', b2bH1.length > 0, b2bH1);

// 6. Page blog
await page.goto(BASE + '/blog', { waitUntil: 'networkidle', timeout: 20000 });
const blogLinks = await page.$$eval('a[href*="/blog/"]', els => els.length);
check('Blog — articles listes', blogLinks > 0, blogLinks + ' liens articles');

// 7. Contact
await page.goto(BASE + '/contact', { waitUntil: 'networkidle', timeout: 20000 });
const contactWa = await page.$eval('a[href*="wa.me/23057745306"]', el => el.href).catch(() => 'NOT FOUND');
check('Contact WhatsApp correct', contactWa.includes('23057745306'), contactWa);

// 8. Version EN
await page.goto(BASE + '/en', { waitUntil: 'networkidle', timeout: 20000 });
const enTitle = await page.title();
check('Version EN charge', enTitle.includes('TRK'), enTitle);

await browser.close();
const pass = results.every(r => r.ok);
const passed = results.filter(r => r.ok).length;
console.log('\n' + (pass ? '🟢 PASS' : '🔴 FAIL') + ' — ' + passed + '/' + results.length + ' checks');
