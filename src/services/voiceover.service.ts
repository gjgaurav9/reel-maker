import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';
import type { VideoScript } from '../schemas/video-script.schema.js';
import { logger } from '../utils/logger.js';

export interface VoiceoverResult {
  scene_number: number;
  audio_path: string;
  audio_url: string;
  estimated_duration_seconds: number;
}

const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export async function generateVoiceovers(
  script: VideoScript,
  reelId: string,
  voice: string = config.DEFAULT_VOICE,
): Promise<VoiceoverResult[]> {
  logger.info(
    { reelId, sceneCount: script.scenes.length, voice },
    'Generating voiceovers',
  );

  const audioDir = path.resolve(config.OUTPUT_DIR, 'audio');
  await fs.mkdir(audioDir, { recursive: true });

  const results: VoiceoverResult[] = [];

  for (const scene of script.scenes) {
    const filename = `${reelId}_scene_${scene.scene_number}.mp3`;
    const audioPath = path.join(audioDir, filename);

    const response = await client.audio.speech.create({
      model: 'tts-1',
      voice,
      input: scene.scene_narration,
      response_format: 'mp3',
    });

    const arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(audioPath, Buffer.from(arrayBuffer));

    logger.debug(
      { scene: scene.scene_number, filename },
      'Generated audio for scene',
    );

    results.push({
      scene_number: scene.scene_number,
      audio_path: audioPath,
      audio_url: `${config.BASE_URL}/output/audio/${filename}`,
      estimated_duration_seconds: scene.duration_seconds,
    });
  }

  logger.info({ reelId, fileCount: results.length }, 'Voiceover generation complete');
  return results;
}
