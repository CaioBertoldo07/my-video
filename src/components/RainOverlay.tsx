/**
 * RainOverlay.tsx
 * ───────────────
 * Efeito de chuva usando SVG animado frame-a-frame com Remotion.
 *
 * Cada gota é definida de forma determinística usando `random()` do Remotion,
 * garantindo que a renderização seja idêntica a cada frame — essencial para
 * exportação de vídeo.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, random } from 'remotion';

interface RainOverlayProps {
  /** Intensidade da chuva: 0 = sem chuva · 1 = chuva máxima (padrão: 0.7) */
  intensity?: number;
  /** Ângulo de inclinação em graus simulando vento (padrão: 12°) */
  windAngle?: number;
}

/** Número base de gotas na tela. Multiplicado por `intensity`. */
const BASE_DROP_COUNT = 350;

export const RainOverlay: React.FC<RainOverlayProps> = ({
  intensity = 0.7,
  windAngle = 12,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const dropCount = Math.floor(BASE_DROP_COUNT * Math.min(1, Math.max(0, intensity)));
  const windRad = (windAngle * Math.PI) / 180;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
      width={width}
      height={height}
    >
      {Array.from({ length: dropCount }, (_, i) => {
        // ── Propriedades estáticas por gota (determinísticas via seed) ─────

        // Posição X inicial (estendemos além dos limites para cobrir o drift do vento)
        const startX = random(`rain-x-${i}`) * (width * 1.3) - width * 0.15;

        // Velocidade de queda em pixels por frame
        const speed = 14 + random(`rain-speed-${i}`) * 20;

        // Comprimento da gota em pixels
        const dropLen = 12 + random(`rain-len-${i}`) * 24;

        // Opacidade da gota
        const opacity = 0.28 + random(`rain-op-${i}`) * 0.52;

        // Espessura do traço
        const strokeWidth = 0.7 + random(`rain-w-${i}`) * 1.0;

        // Offset inicial aleatório para não começarem todas no topo
        const startOffset = random(`rain-off-${i}`) * (height + dropLen);

        // ── Posição calculada para o frame atual ───────────────────────────

        // Y faz wrap-around: quando sai da tela retorna ao topo
        const rawY = (startOffset + frame * speed) % (height + dropLen * 2);
        const y1 = rawY - dropLen;

        // X com drift horizontal causado pelo vento
        const x1 = startX + y1 * Math.tan(windRad);

        // Ponto final da gota (inclinada conforme o vento)
        const x2 = x1 + dropLen * Math.sin(windRad);
        const y2 = y1 + dropLen * Math.cos(windRad);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(174, 214, 241, 0.9)"
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
