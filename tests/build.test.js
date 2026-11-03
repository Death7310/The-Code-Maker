// The deployable build (website + Android) must include every file index.html loads.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

test('build-web produces a complete www/ with a filled-in service worker', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build-web.js')], { stdio: 'pipe' });
  const www = path.join(ROOT, 'www');
  const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 20);
  for (const r of refs) assert.ok(fs.existsSync(path.join(www, r)), 'missing in build: ' + r);
  const sw = fs.readFileSync(path.join(www, 'sw.js'), 'utf8');
  assert.doesNotMatch(sw, /__VERSION__|__ASSETS__/);
  const assets = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
  for (const a of assets) if (a !== './') assert.ok(fs.existsSync(path.join(www, a)), 'precached file missing: ' + a);
  const manifest = JSON.parse(fs.readFileSync(path.join(www, 'manifest.webmanifest'), 'utf8'));
  for (const i of manifest.icons) assert.ok(fs.existsSync(path.join(www, i.src)), i.src);
});

test('Capacitor config points at the build output', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'capacitor.config.json'), 'utf8'));
  assert.strictEqual(cfg.webDir, 'www');
  assert.match(cfg.appId, /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/);
});
