# drope-world

El CV de **Pedro Mollehuanca** como un juego top-down: en vez de scrollear una
lista de trabajos, caminás un mundo y entrás a los espacios que te interesan.

▶️ **[Jugalo acá](https://softpedro.github.io/CV/)**

¿Viniste a leer un CV y no a jugar? El botón **"Ver como CV normal"** está
siempre visible, arriba a la derecha. No hay que ganar nada para llegar al
contenido.

## Cómo se juega

| Acción | Teclado | Touch |
| --- | --- | --- |
| Caminar | Flechas o `WASD` | Joystick en pantalla |
| Entrar a un espacio | `E` cuando aparece el cartel | Botón del cartel |
| Salir de un panel | `Esc` | Botón de cerrar |

Al empezar elegís una **clase** — Reclutador, Cliente, Curioso o Droper — y eso
define dónde spawneás y qué se te muestra primero.

Hay **cuatro espacios**: DROPE CÓDIGO, DROPE JUEGOS, DROPE LECTURA y la PLAZA
DROPE. Repartidos por el mundo hay **4 drops visibles** y **uno escondido**, que
no está en ninguna zona: hay que salirse del camino para encontrarlo.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b` + build de producción a `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Sirve el build ya hecho |

## Arquitectura

Pixi.js para el mundo, React para los overlays, Zustand como puente. Las tres
capas van en una sola dirección:

```
content/  →  data/  →  engine/
 config      stores    simulación
```

- **`content/`** — la config. Espacios, clases, paneles y drops son datos, no
  código: mover una zona o agregar un drop es editar `spaceRegistry.ts`.
- **`data/`** — los stores de Zustand y el fetch de `world-state.json`.
- **`engine/`** — tick loop, input, colisión, cámara, proximidad, tilemap. No
  sabe nada de DROPE ni de CVs; es un motor genérico.
- **`world/`** — jugador y movimiento, atrás de `MovementTransport` (hoy local;
  la interfaz deja lugar a un transporte por red).
- **`ui/`** — los overlays de React.

La regla que mantiene esto ordenado: **el engine escribe los stores, React
lee**. React nunca toca el stage de Pixi, y el engine nunca importa un
componente. Por eso la simulación es agnóstica del renderer — `Proximity`,
`DropSystem` y `Player` son matemática de vectores, y solo cuatro archivos
tocan Pixi.

### Render 2.5D

Es top-down con profundidad, no isométrico. Lo que da el volumen: **Y-sort** por
la posición de los pies, **sombras de contacto** en el piso (los drops flotan,
la sombra no), **muros nine-slice** con coronación elevada, edificios armados
por receta desde `content/`, y una viñeta radial fija a la pantalla.

## Verificación

Además de `tsc` y el linter, hay scripts de Playwright que abren el juego de
verdad. Requieren el dev server corriendo.

| Script | Para qué |
| --- | --- |
| `node scripts/smoke.mjs` | Recorrido completo: spawn, colisión, drops, paneles. Devuelve JSON con `ok`. |
| `node scripts/spawn-check.mjs` | Las 4 clases spawnean y pueden moverse en las 4 direcciones (nadie queda atrapado). |
| `node scripts/shot.mjs <dir>` | Capturas del render, para revisar el arte a ojo. |
| `node scripts/atlas-sheet.mjs <out.png>` | Hoja de contacto del tilesheet con el índice sobre cada tile. |

## Créditos

Los tilesheets de `public/art/` son de [Kenney](https://kenney.nl) — *Tiny Town*
y *Tiny Dungeon*, ambos **CC0**. Cada uno con su licencia al lado en el mismo
directorio.

## Stack

Pixi.js 8 · React 19 · Zustand 5 · TypeScript · Vite · oxlint
