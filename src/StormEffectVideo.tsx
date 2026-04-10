/**
 * StormEffectVideo.tsx
 * ────────────────────
 * Composição principal que combina todos os efeitos de tempestade.
 *
 * Camadas (de baixo para cima):
 *   1. Vídeo base — com color grading via filtros CSS
 *   2. Overlay azul/cinza — reforça o tom de tempestade
 *   3. Névoa sutil — cria profundidade atmosférica
 *   4. Chuva (SVG animado) — intensifica durante relâmpagos
 *   5. Flash de relâmpago — overlay branco/azulado transitório
 *   6. Áudio de trovão (opcional) — sincronizado com os flashes
 *   7. Áudio ambiente de chuva (opcional) — loop contínuo
 *
 * Para personalizar, edite o objeto CONFIG abaixo.
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Video,
  Audio,
  staticFile,
  random,
  interpolate,
} from 'remotion';
import { RainOverlay } from './components/RainOverlay';
import { LightningFlash, useLightningState } from './components/LightningFlash';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES — ajuste aqui para personalizar todos os efeitos
// ══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  // ── Chuva ──────────────────────────────────────────────────────────────────
  /** Intensidade da chuva: 0 (sem chuva) → 1 (chuva intensa). Padrão: 0.7 */
  rainIntensity: 0.7,
  /** Inclinação da chuva em graus (simula vento). Padrão: 12° */
  rainWindAngle: 12,

  // ── Relâmpagos ─────────────────────────────────────────────────────────────
  /**
   * Frequência dos relâmpagos: probabilidade de ocorrer em cada janela de 3s.
   * 0 = nunca · 0.3 = moderado · 0.6 = frequente · 1 = sempre. Padrão: 0.45
   */
  lightningFrequency: 0.45,

  // ── Trovão ─────────────────────────────────────────────────────────────────
  /** Volume do trovão 0–1. Padrão: 0.85 */
  thunderVolume: 0.85,
  /**
   * Ativar áudio de trovão?
   * Requer public/thunder.mp3. Defina true após adicionar o arquivo.
   */
  enableThunderAudio: false,

  // ── Som de chuva ───────────────────────────────────────────────────────────
  /**
   * Ativar som ambiente de chuva em loop?
   * Requer public/rain-ambient.mp3. Defina true após adicionar o arquivo.
   */
  enableRainAudio: false,
  /** Volume do som de chuva 0–1. Padrão: 0.4 */
  rainAudioVolume: 0.4,

  // ── Camera shake ───────────────────────────────────────────────────────────
  /** Intensidade da vibração de câmera durante trovões (px). Padrão: 5 */
  cameraShakeIntensity: 5,
} as const;
// ══════════════════════════════════════════════════════════════════════════════

export const StormEffectVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // ── Estado do relâmpago no frame atual ──────────────────────────────────────
  const { flashOpacity, isActive: isLightning, events } = useLightningState(
    CONFIG.lightningFrequency,
  );

  // ── 1. COLOR GRADING ────────────────────────────────────────────────────────
  // O brilho sobe levemente durante o pico do relâmpago, simulando a iluminação
  // repentina que o flash real causaria no ambiente.
  const brightness = interpolate(flashOpacity, [0, 1], [0.72, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const videoFilter = [
    'saturate(0.48)',            // Dessatura → cores acinzentadas de tempestade
    'contrast(1.28)',            // Mais contraste → drama e tensão
    `brightness(${brightness})`, // Escuro por padrão, sobe no relâmpago
  ].join(' ');

  // ── 2. CAMERA SHAKE ─────────────────────────────────────────────────────────
  // Pequena vibração aleatória frame-a-frame durante relâmpagos.
  // random() com seed baseada no frame é determinístico mas parece orgânico.
  const shakeX = isLightning
    ? (random(`shake-x-${frame}`) - 0.5) * CONFIG.cameraShakeIntensity * 2
    : 0;
  const shakeY = isLightning
    ? (random(`shake-y-${frame}`) - 0.5) * CONFIG.cameraShakeIntensity
    : 0;

  // ── 3. INTENSIDADE DINÂMICA DA CHUVA ────────────────────────────────────────
  // Durante o relâmpago, a chuva fica visivelmente mais intensa.
  const currentRainIntensity = Math.min(1, CONFIG.rainIntensity + (isLightning ? 0.28 : 0));

  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        background: '#000', // Fundo preto para bordas sem conteúdo
      }}
    >
      {/* ── Camada 1: Vídeo base com color grading + camera shake ─────────── */}
      <div
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          width: '100%',
          height: '100%',
          // Scale ligeiramente maior para esconder bordas durante o shake
          scale: '1.02',
        }}
      >
        <Video
          src={staticFile('storm-video.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: videoFilter,
          }}
        />
      </div>

      {/* ── Camada 2: Overlay azul/cinza (cor de tempestade) ─────────────── */}
      {/*
       * mixBlendMode 'multiply' escurece e tinge as cores do vídeo para
       * tons frios de tempestade sem apagar completamente os detalhes.
       */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 30, 65, 0.20)',
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }}
      />

      {/* ── Camada 3: Névoa atmosférica sutil ────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(155, 170, 185, 0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Camada 4: Chuva (SVG animado) ────────────────────────────────── */}
      <RainOverlay
        intensity={currentRainIntensity}
        windAngle={CONFIG.rainWindAngle}
      />

      {/* ── Camada 5 + 6: Flash de relâmpago + áudio de trovão ───────────── */}
      <LightningFlash
        events={events}
        flashOpacity={flashOpacity}
        thunderVolume={CONFIG.thunderVolume}
        enableThunderAudio={CONFIG.enableThunderAudio}
      />

      {/* ── Camada 7: Som ambiente de chuva em loop ───────────────────────── */}
      {/*
       * Para ativar:
       *   1. Baixe um arquivo de chuva (ex: freesound.org)
       *   2. Salve como public/rain-ambient.mp3
       *   3. Mude enableRainAudio para true no CONFIG acima
       */}
      {CONFIG.enableRainAudio && (
        <Audio
          src={staticFile('rain-ambient.mp3')}
          volume={CONFIG.rainAudioVolume}
          loop
        />
      )}
    </div>
  );
};
