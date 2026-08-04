// scripts/shot.mjs — capturas del mundo para revisar el arte a ojo.
// Complementa a smoke.mjs: aquel verifica comportamiento, este muestra el render.
// Requiere el dev server arriba.
//
//   node scripts/shot.mjs <dir-salida> [clase=recruiter]
//
// Genera, con el avatar frente al edificio-ancla de su espacio:
//   0-spawn.png  el avatar en la puerta (spawn = centro del espacio)
//   1-abajo.png  el avatar separado, caminando hacia abajo
//   2-arriba.png el avatar chocando contra el edificio (es sólido: no lo cruza)

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const URL = process.env.SMOKE_URL || 'http://localhost:5173/';
const dir = process.argv[2] ?? 'shots';
const clase = process.argv[3] ?? 'recruiter';
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 5000 });
await page.waitForFunction(() => typeof globalThis.__drope?.debug === 'function', null, { timeout: 5000 });
await page.locator(`[data-testid="class-${clase}"]`).click();
await page.waitForTimeout(400);

const dbg = () => page.evaluate(() => globalThis.__drope.debug());
const shot = async (name) => {
  await page.screenshot({ path: join(dir, name) });
  return (await dbg()).pos;
};
/** Mantiene una tecla `ms` milisegundos y deja asentar la cámara. */
const walk = async (key, ms) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(350); // la cámara hace lerp: esperar a que frene
};

const out = {};
out.spawn = await shot('0-spawn.png');
await walk('ArrowDown', 500);
out.abajo = await shot('1-abajo.png');
await walk('ArrowUp', 1000);
out.arriba = await shot('2-arriba.png');

await browser.close();
console.log(JSON.stringify({ dir, clase, pos: out, errors }, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
