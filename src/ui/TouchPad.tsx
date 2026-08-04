// ui/TouchPad.tsx — joystick táctil mínimo. Empuja un Vec2 (-1..1) al engine.
// Solo se muestra en dispositivos con touch. El engine lo consume vía setTouch.

import { useRef } from 'react';
import type { Vec2 } from '../engine';

const RADIUS = 56; // px del área del stick

export function TouchPad({ onMove }: { onMove: (dir: Vec2 | null) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const handle = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, RADIUS);
    dx = (dx / len) * clamped;
    dy = (dy / len) * clamped;
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove({ x: dx / RADIUS, y: dy / RADIUS });
  };

  const reset = () => {
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
    onMove(null);
  };

  return (
    <div
      ref={baseRef}
      className="touchpad"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handle(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0 && e.pointerType === 'mouse') return;
        handle(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div ref={knobRef} className="touchpad-knob" />
    </div>
  );
}
