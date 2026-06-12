import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'public/icon-512x512.svg')
const out = resolve(root, 'public/icons')

const svgBuf = readFileSync(src)

// icon "any" — direct render
async function plain(size, filename) {
  await sharp(svgBuf).resize(size, size).png().toFile(`${out}/${filename}`)
  console.log(`✓ ${filename}`)
}

// maskable — icône réduite à 70% centrée sur fond plein #16a34a
async function maskable(size, filename) {
  const iconSize = Math.round(size * 0.7)
  const pad = Math.round((size - iconSize) / 2)

  const icon = await sharp(svgBuf)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 22, g: 163, b: 74, alpha: 1 } },
  })
    .composite([{ input: icon, top: pad, left: pad }])
    .png()
    .toFile(`${out}/${filename}`)

  console.log(`✓ ${filename}`)
}

await plain(192, 'icon-192x192.png')
await plain(512, 'icon-512x512.png')
await plain(180, 'apple-touch-icon.png')
await maskable(192, 'icon-maskable-192x192.png')
await maskable(512, 'icon-maskable-512x512.png')

console.log('\nDone — icons in public/icons/')
