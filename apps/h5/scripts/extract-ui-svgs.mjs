import fs from 'fs'
import path from 'path'

const html = fs.readFileSync(
  path.resolve('../../webgl-refraction-restore/scratch/index.html'),
  'utf8',
)
const out = path.resolve('public/webgl-refraction-static/ui')
fs.mkdirSync(out, { recursive: true })

function between(start, end) {
  const a = html.indexOf(start)
  const b = html.indexOf(end, a)
  if (a < 0 || b < 0) return null
  return html.slice(a + start.length, b).trim()
}

const chunks = {
  'logo-labs.svg': between('<div class="corner corner--top">', '<div class="corner corner--top-left">'),
  'side-left.svg': between('<div class="corner corner--left">', '<div class="corner corner--right">'),
  'side-right.svg': between('<div class="corner corner--right">', '</div>\n\t</div>\n\n\t<div class="height-div">'),
}

for (const [name, content] of Object.entries(chunks)) {
  if (!content) {
    console.log('miss', name)
    continue
  }
  fs.writeFileSync(path.join(out, name), content)
  console.log('wrote', name, content.length)
}
