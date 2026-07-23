import sharp from 'sharp'
import { readdirSync, mkdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const SRC  = 'photos'
const DEST = 'public/nursery'
mkdirSync(DEST, { recursive: true })

// Mapping nom fichier → { slug, alt }
const MAP = [
  { src: 'bettrave.jpg',                     slug: 'nursery-01', alt: 'Plants de betterave en pépinière TRK' },
  { src: 'brocolli.jpg',                     slug: 'nursery-02', alt: 'Plants de brocoli en pépinière TRK' },
  { src: 'chou rouge.jpg',                   slug: 'nursery-03', alt: 'Plants de chou rouge en pépinière TRK' },
  { src: 'chou.jpg',                         slug: 'nursery-04', alt: 'Plants de chou en pépinière TRK' },
  { src: 'chou1.jpg',                        slug: 'nursery-05', alt: 'Plants de chou (variété 2) en pépinière TRK' },
  { src: 'chou3317.jpg',                     slug: 'nursery-06', alt: 'Plants de chou 3317 en pépinière TRK' },
  { src: 'choufleur (2).jpg',                slug: 'nursery-07', alt: 'Plants de chou-fleur en pépinière TRK' },
  { src: 'choufleur cristalboy.jpg',         slug: 'nursery-08', alt: 'Plants de chou-fleur Cristalboy en pépinière TRK' },
  { src: 'choufleur.jpg',                    slug: 'nursery-09', alt: 'Plants de chou-fleur (variété) en pépinière TRK' },
  { src: 'concombre.jpg',                    slug: 'nursery-10', alt: 'Plants de concombre en pépinière TRK' },
  { src: 'feuille de chene laitue.jpg',      slug: 'nursery-11', alt: 'Laitue feuille de chêne en pépinière TRK' },
  { src: 'gros piment.jpg',                  slug: 'nursery-12', alt: 'Plants de gros piment en pépinière TRK' },
  { src: 'laitue tourbillon.jpg',            slug: 'nursery-13', alt: 'Laitue Tourbillon en pépinière TRK' },
  { src: 'oignon francia.jpg',               slug: 'nursery-14', alt: 'Plants d\'oignon Francia en pépinière TRK' },
  { src: 'oignon rosada.jpg',                slug: 'nursery-15', alt: 'Plants d\'oignon Rosada en pépinière TRK' },
  { src: 'oignon rubex.jpg',                 slug: 'nursery-16', alt: 'Plants d\'oignon Rubex en pépinière TRK' },
  { src: 'oignon.jpg',                       slug: 'nursery-17', alt: 'Plants d\'oignon en pépinière TRK' },
  { src: 'patisson locale.jpg',              slug: 'nursery-18', alt: 'Plants de pâtisson local en pépinière TRK' },
  { src: 'patisson.jpg',                     slug: 'nursery-19', alt: 'Plants de pâtisson en pépinière TRK' },
  { src: 'persil frisé.jpg',                 slug: 'nursery-20', alt: 'Persil frisé en pépinière TRK' },
  { src: 'persil plat.jpg',                  slug: 'nursery-21', alt: 'Persil plat en pépinière TRK' },
  { src: 'petsai (2).jpg',                   slug: 'nursery-22', alt: 'Plants de petsai en pépinière TRK' },
  { src: 'petsai pommé.jpg',                 slug: 'nursery-23', alt: 'Plants de petsai pommé en pépinière TRK' },
  { src: 'petsai.jpg',                       slug: 'nursery-24', alt: 'Plants de petsai (variété) en pépinière TRK' },
  { src: 'piment carri.jpg',                 slug: 'nursery-25', alt: 'Plants de piment carri en pépinière TRK' },
  { src: 'piment carri2.jpg',                slug: 'nursery-26', alt: 'Plants de piment carri (variété 2) en pépinière TRK' },
  { src: 'poireaux.jpg',                     slug: 'nursery-27', alt: 'Plants de poireaux en pépinière TRK' },
  { src: 'poireaux1.jpg',                    slug: 'nursery-28', alt: 'Plants de poireaux (variété) en pépinière TRK' },
  { src: 'pomme d\'amour ns501.jpg',         slug: 'nursery-29', alt: 'Plants de tomate NS501 en pépinière TRK' },
  { src: 'pomme d\'amour swaraksha.jpg',     slug: 'nursery-30', alt: 'Plants de tomate Swaraksha en pépinière TRK' },
  { src: 'pomme d\'amour swaraksha2.jpg',    slug: 'nursery-31', alt: 'Plants de tomate Swaraksha (lot 2) en pépinière TRK' },
  { src: 'pomme d\'amour.jpg',               slug: 'nursery-32', alt: 'Plants de tomate (pomme d\'amour) en pépinière TRK' },
]

console.log('\n' + '─'.repeat(70))
console.log('Avant → Après (Ko)')
console.log('─'.repeat(70))

const manifest = []
for (const { src, slug, alt } of MAP) {
  const srcPath  = join(SRC, src)
  const destPath = join(DEST, `${slug}.jpg`)
  try {
    const before = statSync(srcPath).size
    const { width: origW, height: origH } = await sharp(srcPath).metadata()
    await sharp(srcPath)
      .rotate()                        // auto-orient EXIF
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(destPath)
    const after = statSync(destPath).size
    const pct = Math.round((1 - after/before)*100)
    console.log(`${src.padEnd(38)} ${String(Math.round(before/1024)).padStart(5)} Ko → ${String(Math.round(after/1024)).padStart(5)} Ko  (-${pct}%)`)
    manifest.push({ file: `/${destPath.replace(/\/g,'/')}`, alt, origW, origH })
  } catch (e) {
    console.error(`ERREUR ${src}: ${e.message}`)
  }
}

console.log('─'.repeat(70))
console.log('\nManifest pour Nursery.jsx:')
console.log(JSON.stringify(manifest.map(m => ({ file: m.file, alt: m.alt })), null, 2))
