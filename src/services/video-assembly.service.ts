import { Client as Creatomate } from 'creatomate';
import { config } from '../config/index.js';
import { buildRenderScript } from '../templates/reel-renderscript.js';
import type { VideoScript } from '../schemas/video-script.schema.js';
import type { VoiceoverResult } from './voiceover.service.js';
import { logger } from '../utils/logger.js';

const client = new Creatomate(config.CREATOMATE_API_KEY);

export async function assembleVideo(
  script: VideoScript,
  voiceovers: VoiceoverResult[],
  aspectRatio: string = '9:16',
): Promise<string> {
  const renderScript = buildRenderScript(script, voiceovers, aspectRatio);

  logger.info(
    { sceneCount: script.scenes.length, aspectRatio },
    'Submitting video render to Creatomate',
  );

  // render() waits for completion and returns the finished render(s)
  const renders = await client.render({
    source: renderScript,
  });

  const render = renders[0];

  if (render.status !== 'succeeded') {
    throw new Error(
      `Video render failed: ${render.errorMessage ?? 'Unknown error'}`,
    );
  }

  logger.info(
    { renderId: render.id, url: render.url, duration: render.duration },
    'Video render complete',
  );

  return render.url;
}
