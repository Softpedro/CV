// ui/accent.ts — mapea un PaletteColor del Style Bible a su CSS var.
// Los componentes usan siempre tokens, nunca hex sueltos.
import type { PaletteColor } from '../engine';

export const accentVar: Record<PaletteColor, string> = {
  ink: 'var(--ink)',
  paper: 'var(--paper)',
  violet: 'var(--violet)',
  lime: 'var(--lime)',
  aqua: 'var(--aqua)',
  coral: 'var(--coral)',
};
