// scripts/gen-map.mjs — genera el mapa de prueba en formato Tiled JSON.
// Layout alineado al content/spaceRegistry: Plaza central (hub) + 4 salas en las
// esquinas (Código TL, Juegos TR, Lectura BL, Lab BR), cada una con una puerta a
// la Plaza. La fuente de verdad de las ZONAS es content/, no el mapa: acá solo
// se dibujan piso y muros. Reemplazable por un export real de Tiled/LDtk.
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 40, H = 28, T = 32;
const floor = new Array(W * H).fill(1);
const wall = new Array(W * H).fill(0);
const set = (x, y, v) => { wall[y * W + x] = v; };
const vwall = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, 1); };
const hwall = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y, 1); };
const door = (x, y) => set(x, y, 0);

// Borde exterior.
hwall(0, 0, W - 1); hwall(H - 1, 0, W - 1);
vwall(0, 0, H - 1); vwall(W - 1, 0, H - 1);

// Código (arriba-izq): muro derecho col13 + muro inferior row10, puerta abajo.
vwall(13, 1, 10); hwall(10, 1, 13); door(6, 10); door(7, 10);
// Juegos (arriba-der): muro izq col26 + muro inferior row10, puerta abajo.
vwall(26, 1, 10); hwall(10, 26, 38); door(32, 10); door(33, 10);
// Lectura (abajo-izq): muro derecho col13 + muro superior row17, puerta arriba.
vwall(13, 17, 26); hwall(17, 1, 13); door(6, 17); door(7, 17);
// Lab (abajo-der): muro izq col26 + muro superior row17, puerta arriba.
vwall(26, 17, 26); hwall(17, 26, 38); door(32, 17); door(33, 17);

const map = {
  width: W, height: H, tilewidth: T, tileheight: T,
  layers: [
    { name: 'floor', type: 'tilelayer', width: W, height: H, data: floor },
    { name: 'walls', type: 'tilelayer', width: W, height: H, data: wall },
  ],
};

mkdirSync('public/maps', { recursive: true });
writeFileSync('public/maps/testroom.json', JSON.stringify(map));
console.log(`wrote public/maps/testroom.json (${W}x${H} tiles, ${W * T}x${H * T}px)`);
