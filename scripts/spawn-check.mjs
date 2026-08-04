// Verifica que ninguna clase quede ATRAPADA al spawnear ahora que los
// edificios son sólidos: cada spawn debe poder moverse en varias direcciones.
import { chromium } from 'playwright';

const URL = 'http://localhost:5173/';
const CLASSES = ['recruiter', 'client', 'curious', 'droper'];
const KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const out = [];
for (const clase of CLASSES) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof globalThis.__drope?.debug === 'function', null, { timeout: 5000 });
  await page.locator(`[data-testid="class-${clase}"]`).click();
  await page.waitForTimeout(400);

  const dbg = () => page.evaluate(() => globalThis.__drope.debug());
  const spawn = (await dbg()).pos;
  const moved = {};
  for (const key of KEYS) {
    const from = (await dbg()).pos;
    await page.keyboard.down(key);
    await page.waitForTimeout(260);
    await page.keyboard.up(key);
    await page.waitForTimeout(100);
    const to = (await dbg()).pos;
    moved[key] = Math.hypot(to.x - from.x, to.y - from.y) > 2;
    // volver al punto de partida para que cada eje se mida desde el spawn
    const back = { ArrowDown: 'ArrowUp', ArrowUp: 'ArrowDown', ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' }[key];
    await page.keyboard.down(back);
    await page.waitForTimeout(260);
    await page.keyboard.up(back);
    await page.waitForTimeout(100);
  }
  const free = KEYS.filter((k) => moved[k]).length;
  out.push({ clase, spawn, moved, free, trapped: free === 0, errors });
  await page.close();
}

await browser.close();
const trapped = out.filter((o) => o.trapped || o.errors.length);
console.log(JSON.stringify({ ok: trapped.length === 0, out }, null, 2));
process.exit(trapped.length === 0 ? 0 : 1);
