import sharp from 'sharp'
import { statSync, mkdirSync } from 'fs'
import { join } from 'path'

const SRC  = 'photos'
const DEST = 'public/products'
mkdirSync(DEST, { recursive: true })

// ⚠️ oignon francia/rosada/rubex : MD5 identiques (même fichier source)
// traités quand même en 3 slugs distincts selon la demande
const MAP = [
  ['bettrave.jpg',                   'betterave.jpg'],
  ['brocolli.jpg',                   'brocoli.jpg'],
  ['chou rouge.jpg',                 'chou-rouge.jpg'],
  ['chou.jpg',                       'chou.jpg'],
  ['chou1.jpg',                      'chou-2.jpg'],
  ['chou3317.jpg',                   'chou-3317.jpg'],
  ['choufleur (2).jpg',              'choufleur-2.jpg'],
  ['choufleur cristalboy.jpg',       'choufleur-cristalboy.jpg'],
  ['choufleur.jpg',                  'choufleur.jpg'],
  ['concombre.jpg',                  'concombre.jpg'],
  ['feuille de chene laitue.jpg',    'laitue-feuille-chene.jpg'],
  ['gros piment.jpg',                'gros-piment.jpg'],
  ['laitue tourbillon.jpg',          'laitue-tourbillon.jpg'],
  ['oignon.jpg',                     'oignon.jpg'],
  ['oignon francia.jpg',             'oignon-francia.jpg'],
  ['oignon rosada.jpg',              'oignon-rosada.jpg'],
  ['oignon rubex.jpg',               'oignon-rubex.jpg'],
  ['patisson locale.jpg',            'patisson-locale.jpg'],
  ['patisson.jpg',                   'patisson.jpg'],
  ['persil frisé.jpg',               'persil-frise.jpg'],
  ['persil plat.jpg',                'persil-plat.jpg'],
  ['petsai (2).jpg',                 'petsai-2.jpg'],
  ['petsai pommé.jpg',               'petsai-pomme.jpg'],
  ['petsai.jpg',                     'petsai.jpg'],
  ['piment carri.jpg',               'piment-carri.jpg'],
  ['piment carri2.jpg',              'piment-carri-2.jpg'],
  ['poireaux.jpg',                   'poireaux.jpg'],
  ['poireaux1.jpg',                  'poireaux-2.jpg'],
  ["pomme d'amour ns501.jpg",        'pomme-d-amour-ns501.jpg'],
  ["pomme d'amour swaraksha.jpg",    'pomme-d-amour-swaraksha.jpg'],
  ["pomme d'amour swaraksha2.jpg",   'pomme-d-amour-swaraksha-2.jpg'],
  ["pomme d'amour.jpg",              'pomme-d-amour.jpg'],
]

const W = 40
console.log('\n' + '─'.repeat(72))
console.log(('Source').padEnd(W) + ' Avant'.padStart(8) + '  Après'.padStart(8) + '  Gain')
console.log('─'.repeat(72))

let totalBefore = 0, totalAfter = 0
for (const [src, dest] of MAP) {
  const srcPath  = join(SRC, src)
  const destPath = join(DEST, dest)
  try {
    const before = statSync(srcPath).size
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(destPath)
    const after = statSync(destPath).size
    const gain = Math.round((1 - after / before) * 100)
    totalBefore += before; totalAfter += after
    console.log(
      src.padEnd(W) +
      (Math.round(before/1024) + ' Ko').padStart(8) +
      (Math.round(after/1024) + ' Ko').padStart(8) +
      `  -${gain}%`
    )
  } catch (e) {
    console.error(`ERREUR ${src}: ${e.message}`)
  }
}

console.log('─'.repeat(72))
console.log(
  'TOTAL'.padEnd(W) +
  (Math.round(totalBefore/1024) + ' Ko').padStart(8) +
  (Math.round(totalAfter/1024) + ' Ko').padStart(8) +
  `  -${Math.round((1 - totalAfter/totalBefore)*100)}%`
)
console.log('\n⚠️  oignon-francia/rosada/rubex ont le même MD5 — 3 fichiers identiques traités séparément')
