#!/usr/bin/env node
/*
 * Builds the deployable site into www/ (used by GitHub Pages and by the
 * Capacitor Android app). Copies the static files and generates sw.js with
 * a precache list and a content-hash version, so updates reach users.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const INCLUDE = ['index.html', 'manifest.webmanifest', 'css', 'js', 'icons'];

function walk(rel) {
  const full = path.join(ROOT, rel);
  if (fs.statSync(full).isDirectory()) return fs.readdirSync(full).sort().flatMap((f) => walk(path.join(rel, f)));
  return [rel.split(path.sep).join('/')];
}

fs.rmSync(OUT, { recursive: true, force: true });
const files = INCLUDE.flatMap(walk);
const hash = crypto.createHash('sha256');
for (const f of files) {
  const dest = path.join(OUT, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = fs.readFileSync(path.join(ROOT, f));
  hash.update(f).update(buf);
  fs.writeFileSync(dest, buf);
}
const version = hash.digest('hex').slice(0, 12);
const assets = ['./'].concat(files);
const sw = fs.readFileSync(path.join(ROOT, 'sw.template.js'), 'utf8')
  .replace("const CACHE = 'codemaker-__VERSION__';", `const CACHE = 'codemaker-${version}';`)
  .replace('const ASSETS = __ASSETS__;', `const ASSETS = ${JSON.stringify(assets, null, 2)};`);
if (sw.includes('__VERSION__') || sw.includes('__ASSETS__')) throw new Error('sw.js placeholders were not filled');
fs.writeFileSync(path.join(OUT, 'sw.js'), sw);
// GitHub Pages: serve files as-is (no Jekyll processing).
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Built ${files.length} files into www/ (version ${version})`);
