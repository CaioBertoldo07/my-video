/**
 * LightningFlash.tsx
 * ──────────────────
 * Gerencia relâmpagos e trovões de forma determinística.
 *
 * A cada 3 segundos o sistema "sorteia" se deve ocorrer um relâmpago usando
 * `random()` do Remotion (seed fixo por intervalo → resultado idêntico em
 * qualquer frame ou renderização). Isso elimina o uso de useState/Math.random
 * que quebrariam a renderização determinística do Remotion.
 *
 * Estrutura de um evento de relâmpago:
 *   startFrame   → frame em que o flash começa
 *   flashDuration → quantos frames dura o pico brilhante
 *   intensity    → brilho máximo (0–1)
 *
 * O trovão toca 0.5–1.5 s depois usando <Sequence> + <Audio>.
 * Para ativar o áudio: adicione thunder.mp3 em public/ e passe enableThunderAudio=true.
 */

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  random,
  interpolate,
  Sequence,
  Audio,
  staticFile,
} from 'remotion';

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface LightningEvent {
  /** Frame em que o flash começa */
  startFrame: number;
  /** Duração do pico brilhante em frames */
  flashDuration: number;
  /** Intensidade máxima do flash (0–1) */
  intensity: number;
}

interface LightningFlashProps {
  /** Lista pré-computada de eventos (gerada por useLightningState) */
  events: LightningEvent[];
  /** Opacidade atual do flash (0–1) calculada por useLightningState */
  flashOpacity: number;
  /** Volume do trovão 0–1 (padrão: 0.85) */
  thunderVolume?: number;
  /**
   * Ativar áudio de trovão?
   * Requer public/thunder.mp3. Padrão: false.
   */
  enableThunderAudio?: boolean;
}

// ─── Gerador determinístico de eventos ────────────────────────────────────

/**
 * Gera a lista de relâmpagos para o vídeo inteiro.
 * Determinístico: mesmos parâmetros → mesma lista sempre.
 *
 * @param durationInFrames Duração total da composição
 * @param fps              Frames por segundo
 * @param frequency        Probabilidade por janela de 3s (0–1)
 */
export const generateLightningEvents = (
  durationInFrames: number,
  fps: number,
  frequency: number,
): LightningEvent[] => {
  const events: LightningEvent[] = [];
  // Janela de verificação: a cada 3 segundos
  const intervalFrames = Math.floor(fps * 3);

  // Começa após 2s para não ter relâmpago imediato no início
  for (let check = fps * 2; check < durationInFrames; check += intervalFrames) {
    const seed = Math.floor(check / intervalFrames);

    // Sorteia se haverá relâmpago nesta janela
    if (random(`lg-trigger-${seed}`) < frequency) {
      // Offset aleatório dentro da janela
      const offset = Math.floor(random(`lg-offset-${seed}`) * intervalFrames * 0.8);
      const startFrame = check + offset;

      // Duração do flash: 2–5 frames (muito rápido, como na vida real)
      const flashDuration = Math.floor(2 + random(`lg-dur-${seed}`) * 3);

      // Intensidade do flash
      const intensity = 0.62 + random(`lg-int-${seed}`) * 0.38;

      if (startFrame + flashDuration < durationInFrames) {
        events.push({ startFrame, flashDuration, intensity });
      }
    }
  }

  return events;
};

// ─── Hook principal ────────────────────────────────────────────────────────

/**
 * Retorna o estado do relâmpago para o frame atual.
 * Chame este hook no componente pai e passe os resultados para <LightningFlash>.
 */
export const useLightningState = (frequency = 0.45) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Gera eventos uma vez (memoizado por deps estáveis)
  const events = useMemo(
    () => generateLightningEvents(durationInFrames, fps, frequency),
    [durationInFrames, fps, frequency],
  );

  // Calcula opacidade do flash no frame atual
  let flashOpacity = 0;
  let isActive = false;

  for (const ev of events) {
    // Janela: pico + decay de ~0.3s
    const decayFrames = Math.floor(fps * 0.3);
    const totalWindow = ev.flashDuration + decayFrames;

    if (frame >= ev.startFrame && frame < ev.startFrame + totalWindow) {
      const progress = frame - ev.startFrame;

      if (progress < ev.flashDuration) {
        // Fase de subida: linear rápido até o pico
        flashOpacity = interpolate(
          progress,
          [0, ev.flashDuration - 1],
          [ev.intensity * 0.5, ev.intensity],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
      } else {
        // Fase de decay: cai exponencialmente
        flashOpacity = interpolate(
          progress,
          [ev.flashDuration, ev.flashDuration + decayFrames],
          [ev.intensity, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
      }

      isActive = flashOpacity > 0.04;
      break; // Um relâmpago por vez
    }
  }

  return { flashOpacity, isActive, events };
};

// ─── Componente ────────────────────────────────────────────────────────────

export const LightningFlash: React.FC<LightningFlashProps> = ({
  events,
  flashOpacity,
  thunderVolume = 0.85,
  enableThunderAudio = false,
}) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* ── Overlay branco/azulado do flash ──────────────────────────────── */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            // mixBlendMode 'screen' faz o branco "adicionar" luz ao vídeo
            background: `rgba(225, 238, 255, ${flashOpacity})`,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* ── Áudio de trovão sincronizado ─────────────────────────────────── */}
      {/*
       * Para ativar:
       *   1. Adicione um arquivo thunder.mp3 em public/thunder.mp3
       *   2. Passe enableThunderAudio={true} para este componente
       *
       * Cada trovão toca 0.5–1.5s após o relâmpago correspondente.
       * O volume é proporcional à intensidade do relâmpago.
       */}
      {enableThunderAudio &&
        events.map((ev, i) => {
          // Delay do trovão: 0.5–1.5 segundos após o relâmpago
          const delaySeconds = 0.5 + random(`thunder-delay-${i}`) * 1.0;
          const thunderStart = ev.startFrame + Math.floor(delaySeconds * fps);

          return (
            <Sequence
              key={`thunder-${i}`}
              from={thunderStart}
              durationInFrames={Math.floor(fps * 4)}
            >
              <Audio
                src={staticFile('thunder.mp3')}
                volume={() => thunderVolume * ev.intensity}
              />
            </Sequence>
          );
        })}
    </>
  );
};
