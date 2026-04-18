import type { VideoScript } from '../schemas/video-script.schema.js';
import type { VoiceoverResult } from '../services/voiceover.service.js';

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

const MOOD_COLORS: Record<string, string> = {
  energetic: '#FF6B35',
  calm: '#2D7DD2',
  dark: '#1A1A2E',
  warm: '#F4A261',
  professional: '#264653',
  fun: '#E76F51',
  inspiring: '#2A9D8F',
};

const DEFAULT_COLOR = '#264653';

export function buildRenderScript(
  script: VideoScript,
  voiceovers: VoiceoverResult[],
  aspectRatio: string = '9:16',
): Record<string, unknown> {
  const dims = DIMENSIONS[aspectRatio] ?? DIMENSIONS['9:16'];
  const bgColor = MOOD_COLORS[script.mood.toLowerCase()] ?? DEFAULT_COLOR;

  let currentTime = 0;

  const sceneElements = script.scenes.map((scene) => {
    const voiceover = voiceovers.find(
      (v) => v.scene_number === scene.scene_number,
    );
    const startTime = currentTime;
    currentTime += scene.duration_seconds;

    const yPosition =
      scene.text_position === 'top'
        ? '20%'
        : scene.text_position === 'bottom'
          ? '80%'
          : '50%';

    const elements: Record<string, unknown>[] = [
      // Background
      {
        type: 'shape',
        shape: 'rectangle',
        width: '100%',
        height: '100%',
        fill_color: bgColor,
      },
      // Text overlay
      {
        type: 'text',
        text: scene.text_overlay,
        y: yPosition,
        width: '80%',
        x: '50%',
        x_alignment: '50%',
        y_alignment: '50%',
        font_family: 'Inter',
        font_weight: '700',
        font_size: aspectRatio === '9:16' ? '7 vmin' : '5 vmin',
        fill_color: '#FFFFFF',
        text_alignment: 'center',
      },
    ];

    // Voiceover audio
    if (voiceover) {
      elements.push({
        type: 'audio',
        source: voiceover.audio_url,
      });
    }

    return {
      type: 'composition',
      track: 1,
      time: startTime,
      duration: scene.duration_seconds,
      elements,
    };
  });

  return {
    output_format: 'mp4',
    width: dims.width,
    height: dims.height,
    frame_rate: 30,
    elements: sceneElements,
  };
}
