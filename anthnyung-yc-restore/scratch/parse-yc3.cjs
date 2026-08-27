const fs = require('fs');
const path = require('path');
const dir = __dirname;

const page = fs.readFileSync(path.join(dir, 'page-pretty.js'), 'utf8');
const c983 = fs.readFileSync(path.join(dir, '983-b3b997b6e5d650ae.js'), 'utf8');

// Find exports / component names in 983
const exportHits = [...c983.matchAll(/([A-Za-z0-9_]+)\s*[=:]\s*function|\.([A-Za-z]+Gradient)|ShaderMount|createShader|Mesh|Glass|Fluted|Paper/g)].slice(0, 50);
console.log('983 hits', exportHits.map(m => m[0]).slice(0, 40));

// Search known paper shader names
const names = ['MeshGradient','StaticMeshGradient','GrainGradient','LiquidMetal','FlutedGlass','Glass','PaperTexture','NeuroNoise','SmokeRing','Warp','Swirl'];
for (const n of names) {
  console.log(n, 'page', page.includes(n), '983', c983.includes(n), 'big', fs.readFileSync(path.join(dir,'b536a0f1-bdb433004a98de3c.js'),'utf8').includes(n));
}

// Extract JSX-like prop objects near FF6A00
const colorIdx = page.indexOf('#FF6A00');
console.log('\ncolor context\n', page.slice(colorIdx - 500, colorIdx + 800));

const colorIdx2 = page.indexOf('#ffc487');
console.log('\ncolor2 context\n', page.slice(colorIdx2 - 400, colorIdx2 + 600));

// Phase machine strings
for (const ph of ['attached','perforation','chopping','tearing','holding','settling','detached']) {
  let c=0,i=0; while((i=page.indexOf('"'+ph+'"',i))!==-1){c++;i++;}
  console.log('phase', ph, c);
}

// Find roll canvas drawing - search in page for roll-canvas setup
const rollIdx = page.indexOf('roll-canvas');
console.log('\nroll context\n', page.slice(rollIdx - 200, rollIdx + 500));
