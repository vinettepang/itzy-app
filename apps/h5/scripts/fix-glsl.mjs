import fs from 'fs'
import path from 'path'

const dir = path.resolve('src/pages/webgl-refraction/shaders')
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.glsl')) continue
  const p = path.join(dir, f)
  const t = fs.readFileSync(p, 'utf8').replace(/`/g, '')
  fs.writeFileSync(p, t)
  console.log(f, 'ok', t.length)
}
