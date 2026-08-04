// scripts/smoke.mjs — smoke test headless del mundo (paso 7).
// Verifica el flujo completo: monta sin errores → onboarding → elegir clase →
// spawn en la zona correcta → proximidad + panel por E → HUD → CVEscape →
// movimiento + colisión. Reutilizable en cada paso.

import { chromium } from 'playwright';

const URL = process.env.SMOKE_URL || 'http://localhost:5173/';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });

const errors = [];
const warnings = [];
page.on('console', (msg) => {
  const t = msg.type();
  if (t === 'error') errors.push(msg.text());
  else if (t === 'warning') warnings.push(msg.text());
});
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

const R = {};

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 5000 });
await page.waitForFunction(() => typeof globalThis.__drope?.debug === 'function', null, { timeout: 5000 });
await page.waitForFunction(() => globalThis.__stores?.world?.getState().status === 'ready', null, { timeout: 5000 });

const game = () => page.evaluate(() => globalThis.__stores.game.getState());
const dbg = () => page.evaluate(() => globalThis.__drope.debug());

R.canvasCount = await page.locator('canvas').count();

// (1) Estado inicial: onboarding + CVEscape visibles, sin clase.
R.onboardingVisible = await page.locator('[data-testid="onboarding"]').isVisible();
R.cvEscapeAlwaysVisible = await page.locator('[data-testid="cv-escape"]').isVisible();
R.classNullAtStart = (await game()).visitorClass === null;
R.atlasReady = (await dbg()).atlasReady === true; // tilesheet del mundo cargó
R.charsReady = (await dbg()).charsReady === true; // sheet de personajes cargó

// (2) Elegir Reclutador → spawnea en Código (según spawnFor).
await page.locator('[data-testid="class-recruiter"]').click();
await page.waitForTimeout(300);
const g2 = await game();
const pos2 = await dbg();
R.classChosen = g2.visitorClass === 'recruiter';
R.onboardingGone = !(await page.locator('[data-testid="onboarding"]').isVisible());
R.spawnedInCodigo = Math.abs(pos2.pos.x - 290) < 20 && Math.abs(pos2.pos.y - 215) < 20;
R.nearZoneCodigo = g2.nearZone === 'codigo';

// (2a) El edificio-ancla es sólido: subir desde el spawn choca contra la casa.
// Sin colisión el avatar cruzaría a y≈103; el sólido lo frena apenas arriba del spawn.
await page.keyboard.down('ArrowUp');
await page.waitForTimeout(700);
await page.keyboard.up('ArrowUp');
await page.waitForTimeout(120);
const afterUp = await dbg();
R.buildingBlocks = afterUp.pos.y > 200;

// (2b) La caza: caminar hacia abajo sobre el drop de Código (290,250) → se recoge.
R.dropsZeroAtStart = (await dbg()).collected === 0;
await page.keyboard.down('ArrowDown');
await page.waitForTimeout(400);
await page.keyboard.up('ArrowDown');
await page.waitForTimeout(120);
R.dropCollected = (await dbg()).collected === 1;
const hudDrops = page.locator('[data-testid="hud-drops"]');
R.hudShowsDrops = (await hudDrops.innerText()).includes('1/4');
// Idempotencia: quedarse sobre el drop no vuelve a sumar.
await page.keyboard.down('ArrowDown');
await page.waitForTimeout(200);
await page.keyboard.up('ArrowDown');
await page.waitForTimeout(120);
R.dropIdempotent = (await dbg()).collected === 1;

// (3) Presionar E → abre el panel de Código con datos del store.
await page.keyboard.press('e');
await page.waitForTimeout(200);
R.panelOpen = (await game()).openPanel === 'codigo';
const panel = page.locator('[data-testid="space-panel"]');
R.panelVisible = await panel.isVisible();
R.panelIsCodigo = (await panel.getAttribute('data-space')) === 'codigo';
R.panelHasStoreData = (await panel.innerText()).includes('tars'); // dato mock de github

// (4) Escape cierra el panel.
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
R.panelClosed = (await game()).openPanel === null;

// (5) HUD: clase + presencia.
const hud = page.locator('[data-testid="hud"]');
R.hudVisible = await hud.isVisible();
const hudText = await hud.innerText();
R.hudHasClass = hudText.includes('Reclutador');
R.hudHasPresence = hudText.toLowerCase().includes('away');

// (6) CVEscape → vista CV con datos reales; Escape cierra.
await page.locator('[data-testid="cv-escape"]').click();
await page.waitForTimeout(150);
const cvVisible = await page.locator('[data-testid="cv-view"]').isVisible();
R.cvOpens = cvVisible;
R.cvHasName = cvVisible && (await page.locator('[data-testid="cv-view"]').innerText()).includes('Pedro Mollehuanca');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
R.cvClosed = !(await page.locator('[data-testid="cv-view"]').isVisible());

// (7) Movimiento (tras cerrar overlays) + colisión con muro.
const gameBeforeMove = await game();
const before = await dbg();
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(500);
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(120);
const afterRight = await dbg();
R.avatarMoves = afterRight.pos.x > before.pos.x + 1 && afterRight.facing === 'right';

await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(2500);
await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(120);
const afterLeft = await dbg();
R.collidesWall = afterLeft.pos.x > 34 && afterLeft.pos.x < 70; // frena en el muro, no en x=0

R._diag = {
  gameBeforeMove: { openPanel: gameBeforeMove.openPanel, cvOpen: gameBeforeMove.cvOpen, visitorClass: gameBeforeMove.visitorClass },
  afterUp: afterUp.pos,
  before: before.pos,
  afterRight: afterRight.pos,
  afterLeft: afterLeft.pos,
};

await browser.close();

R.errors = errors;
R.warnings = warnings;

const checks = Object.entries(R).filter(([k]) => !k.startsWith('_') && !['errors', 'warnings', 'canvasCount'].includes(k));
const failed = checks.filter(([, v]) => v !== true).map(([k]) => k);
const ok = errors.length === 0 && R.canvasCount === 1 && failed.length === 0;

console.log(JSON.stringify({ ok, failed, ...R }, null, 2));
process.exit(ok ? 0 : 1);
