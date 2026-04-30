// Optimize usage-*.png images: keep visual quality, dramatically reduce size
// Usage: node scripts/optimize-usage-images.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const FILES = ['usage-cephe.png', 'usage-icmekan.png', 'usage-zemin.png', 'usage-bahce.png']

// Card displays at ~360px wide on desktop, 3:4 aspect → 360x480
// 2x for retina/high-DPI = 800x1067
const TARGET_WIDTH = 1000

async function run() {
  for (const file of FILES) {
    const src = path.join(PUBLIC_DIR, file)
    if (!fs.existsSync(src)) {
      console.log(`SKIP ${file} (not found)`)
      continue
    }
    const before = fs.statSync(src).size

    // Convert PNG → JPG (taş fotoları, alpha kanal gerekmiyor)
    const outFile = file.replace('.png', '.jpg')
    const out = path.join(PUBLIC_DIR, outFile)

    await sharp(src)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true, progressive: true })
      .toFile(out)

    const after = fs.statSync(out).size
    const saving = ((1 - after / before) * 100).toFixed(1)
    console.log(`${file}: ${(before / 1024 / 1024).toFixed(2)}MB → ${outFile} ${(after / 1024).toFixed(0)}KB (-${saving}%)`)

    // PNG'yi sil
    fs.unlinkSync(src)
  }
}

run().catch(e => { console.error(e); process.exit(1) })
