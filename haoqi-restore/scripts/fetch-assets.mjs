/**
 * Download haoqi.design production assets for offline analysis.
 * Saves HTML, CSS, JS chunks, and probes for source maps.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'assets');
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'chunks'), { recursive: true });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        res.resume();
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        resolve(get(next, redirects + 1));
        return;
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () =>
        resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString('utf8'), ct: res.headers['content-type'] }),
      );
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

async function main() {
  // 1. HTML
  const html = await get('https://haoqi.design/');
  writeFileSync(join(outDir, 'index.html'), html.text);
  console.log('HTML', html.status, html.text.length, 'bytes');

  // 2. CSS
  const css = await get('https://haoqi.design/_next/static/chunks/635eb04122aa774f.css');
  writeFileSync(join(outDir, 'styles.css'), css.text);
  console.log('CSS', css.status, css.text.length, 'bytes');

  // 3. JS chunks + source map probe
  const chunks = [
    '7cc1924554447827', '83f95f6c165018c5', '8c2d1abc8462562b',
    'turbopack-425288158aa66df2', '1552c7742c37f06d', '8f06fe72571f37b9',
    'e553ef8ae208a000', 'd59f7a97fb1c563f', '1098c2541054fc77',
    '1ed7a178f7acd3df', '7758f29a8aeb1c60', 'a6dad97d9634a72d', '56b0d8f9f2c1e441',
  ];
  const report = [];
  for (const c of chunks) {
    const url = `https://haoqi.design/_next/static/chunks/${c}.js`;
    const r = await get(url);
    writeFileSync(join(outDir, 'chunks', `${c}.js`), r.text);
    const smMatch = r.text.match(/\/\/# sourceMappingURL=(\S+)/);
    let smStatus = 'none';
    if (smMatch) {
      const smUrl = smMatch[1].startsWith('http')
        ? smMatch[1]
        : `https://haoqi.design/_next/static/chunks/${smMatch[1]}`;
      try {
        const sm = await get(smUrl);
        smStatus = `${sm.status} (${sm.text.length}b)`;
        if (sm.status === 200) writeFileSync(join(outDir, 'chunks', `${c}.js.map`), sm.text);
      } catch (e) {
        smStatus = `err ${e.message}`;
      }
    }
    // signature scan
    const sig = [];
    if (/THREE\.|three|WebGLRenderer|ShaderMaterial|BufferGeometry/i.test(r.text)) sig.push('three');
    if (/precision (highp|mediump)|gl_FragColor|gl_Position|vec4|uniform /i.test(r.text)) sig.push('glsl');
    if (/UnicornStudio/i.test(r.text)) sig.push('unicorn');
    if (/troika/i.test(r.text)) sig.push('troika-text');
    if (/gsap|ScrollTrigger/i.test(r.text)) sig.push('gsap');
    if (/lenis/i.test(r.text)) sig.push('lenis');
    if (/matcap/i.test(r.text)) sig.push('matcap');
    if (/EnvironmentMap|PMREM|envMap/i.test(r.text)) sig.push('envmap');
    report.push({ c, bytes: r.text.length, sm: smStatus, sig: sig.join(',') || '-' });
    console.log(c, r.status, r.text.length, 'sm:', smStatus, 'sig:', sig.join(',') || '-');
  }
  writeFileSync(join(outDir, 'chunk-report.json'), JSON.stringify(report, null, 2));
  console.log('\nDone. Assets in', outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
