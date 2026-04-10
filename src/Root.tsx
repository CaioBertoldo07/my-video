/**
 * Root.tsx
 * ────────
 * Registro das composições Remotion.
 *
 * IMPORTANTE: ajuste os parâmetros da composição StormEffectVideo:
 *
 *   durationInFrames → frames totais = fps × duração_em_segundos
 *                      Ex: vídeo de 45s a 30fps → 45 × 30 = 1350
 *
 *   fps → deve bater com o fps do vídeo original (geralmente 30)
 *
 *   width / height → resolução do seu vídeo (verifique com: ffprobe storm-video.mp4)
 */

import './index.css';
import { Composition } from 'remotion';
import { StormEffectVideo } from './StormEffectVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StormEffectVideo"
        component={StormEffectVideo}
        // ── Ajuste estes valores para o seu vídeo ──────────────────────────
        durationInFrames={900} // 30 segundos × 30fps — ajuste conforme seu vídeo
        fps={30}
        width={1280}
        height={720}
        // ───────────────────────────────────────────────────────────────────
      />
    </>
  );
};
