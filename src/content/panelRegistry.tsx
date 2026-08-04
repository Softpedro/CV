// content/panelRegistry.tsx — mapea PanelId → componente React.
// El SpacePanel resuelve el panel SOLO por acá (nunca con switch/if por id).
// Agregar un panel = registrar su componente con su PanelId.
//
// Es la costura entre config (content) y presentación (ui): el único archivo de
// content que referencia componentes de ui. No se re-exporta desde content/index
// para no arrastrar React a quien solo importa la config (engine/bootstrap).

import type { FC } from 'react';
import type { SpaceDefinition, PanelId } from './types';
import { CodePanel } from '../ui/panels/CodePanel';
import { GamesPanel } from '../ui/panels/GamesPanel';
import { ReadingPanel } from '../ui/panels/ReadingPanel';
import { PlazaPanel } from '../ui/panels/PlazaPanel';

export type PanelProps = { space: SpaceDefinition };
export type PanelComponent = FC<PanelProps>;

export const panelRegistry: Record<PanelId, PanelComponent> = {
  code: CodePanel,
  games: GamesPanel,
  reading: ReadingPanel,
  plaza: PlazaPanel,
};
