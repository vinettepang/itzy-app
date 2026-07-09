import fs from 'fs'
import path from 'path'

const dir = path.resolve('public/webgl-refraction-static/ui')
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.svg')) continue
  const p = path.join(dir, file)
  let t = fs.readFileSync(p, 'utf8')
  t = t.replace(/<\/div>\s*$/i, '').trim()
  t = t.replace(/fill="#414141"/g, '')
  fs.writeFileSync(p, t)
  console.log('fixed', file)
}
