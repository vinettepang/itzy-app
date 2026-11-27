/**
 * Patches noth main bundle for H5 SPA (/noth/*): virtual home path, reinit hook, studio hash navigation.
 * Also emits main.hero.mjs — same bundle but FC() only exposes gsap + hero WebGL (for React runtime).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN = join(__dirname, '../public/noth/assets/8cae500c5405-main.js');
const OUT_SPA = join(__dirname, '../public/noth/assets/8cae500c5405-main.spa.js');
const OUT_HERO = join(__dirname, '../public/noth/assets/8cae500c5405-main.hero.mjs');

const homeCheck = 'return r==="/"||r==="/index.html"';
const homeCheckSpa =
  'return r==="/"||r==="/index.html"||r==="/noth"||r==="/noth/"';

function applyBasePatches(source) {
  let s = source;
  if (!s.includes(homeCheck)) {
    throw new Error('Expected home pathname check not found in main.js');
  }
  s = s.replaceAll(homeCheck, homeCheckSpa);

  const taxiHome =
    'Nh?Nh.navigateTo("/"):window.location.href=`/#${n}`';
  const taxiHomeSpa =
    'window.dispatchEvent(new CustomEvent("noth:goto-home",{detail:{hash:n}}))';
  if (!s.includes(taxiHome)) {
    throw new Error('Expected Taxi home navigation snippet not found');
  }
  s = s.replace(taxiHome, taxiHomeSpa);
  return s;
}

function buildSpaBundle(source) {
  let s = applyBasePatches(source);

  const navEnd = 'e.on("NAVIGATE_END",()=>{';
  const navEndSpa = 'e.on("NAVIGATE_END",window.__nothOnNavigateEnd=()=>{';
  if (!s.includes(navEnd)) {
    throw new Error('NAVIGATE_END handler not found');
  }
  s = s.replace(navEnd, navEndSpa);
  s += `\n;window.__nothReinitPage=function(){typeof window.__nothOnNavigateEnd=="function"&&window.__nothOnNavigateEnd()};\n`;
  return s;
}

function buildHeroBundle(source) {
  const s = applyBasePatches(source);
  const fcTail = /function FC\(\)\{[\s\S]*?window\.gsap=F\}UC\(FC\)\}\)\);/;
  if (!fcTail.test(s)) {
    throw new Error('FC() bootstrap tail not found for hero bundle');
  }
  return s.replace(
    fcTail,
    'function FC(){window.gsap=F,window.__nothHeroFluid={init:mx,destroy:pA}}UC(FC)}));',
  );
}

const raw = readFileSync(IN, 'utf8');
const spa = buildSpaBundle(raw);
const hero = buildHeroBundle(raw);

writeFileSync(OUT_SPA, spa);
writeFileSync(OUT_HERO, hero);
console.log('wrote', OUT_SPA, 'bytes', spa.length);
console.log('wrote', OUT_HERO, 'bytes', hero.length);
