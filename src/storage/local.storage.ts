import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export async function downloadToLocal(
  url: string,
  reelId: string,
): Promise<string> {
  const videoDir = path.resolve(config.OUTPUT_DIR, 'video');
  await fs.mkdir(videoDir, { recursive: true });

  const filename = `${reelId}.mp4`;
  const filePath = path.join(videoDir, filename);

  logger.info({ url, filePath }, 'Downloading video to local storage');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  logger.info({ filePath, size: arrayBuffer.byteLength }, 'Video downloaded');
  return filePath;
}
