// scripts/atlas-sheet.mjs — hoja de contacto del tilesheet con el índice sobre
// cada tile. Herramienta de autor: sirve para elegir índices sin adivinar.
// No toca src ni necesita el dev server (el PNG va inline como data URI).
//
//   node scripts/atlas-sheet.mjs [salida.png] [sheet.png] [tile] [cols]

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'atlas-index.png';
const PNG = process.argv[3] ?? 'public/art/tiny-town.png';
const TILE = Number(process.argv[4] ?? 16);
const COLS = Number(process.argv[5] ?? 12);
const ZOOM = 6;
const b64 = readFileSync(PNG).toString('base64');

// Dimensiones reales del PNG desde la cabecera IHDR.
const buf = readFileSync(PNG);
const w = buf.readUInt32BE(16);
const h = buf.readUInt32BE(20);
const rows = h / TILE;
const cells = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < COLS; c++) {
    cells.push(`<i style="left:${c * TILE * ZOOM}px;top:${r * TILE * ZOOM}px">${r * COLS + c}</i>`);
  }
}

const html = `<style>
  body { margin:0; background:#15161a; }
  #s { position:relative; width:${w * ZOOM}px; height:${h * ZOOM}px;
       image-rendering:pixelated; background:url(data:image/png;base64,${b64});
       background-size:${w * ZOOM}px ${h * ZOOM}px; }
  i { position:absolute; width:${TILE * ZOOM}px; height:${TILE * ZOOM}px;
      box-sizing:border-box; border:1px solid rgba(255,255,255,.25);
      font:700 13px/1 ui-monospace,monospace; color:#c6ff3f; font-style:normal;
      text-shadow:0 0 3px #000,0 0 3px #000,0 0 3px #000; padding:2px; }
</style><div id="s">${cells.join('')}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w * ZOOM, height: h * ZOOM } });
await page.setContent(html);
await page.locator('#s').screenshot({ path: out });
await browser.close();
console.log(`atlas-sheet: ${out} (${rows * COLS} tiles, ${COLS} cols)`);
