import type { Job } from 'bullmq';
import { analyzeContent } from './content-analysis.service.js';
import { generateVoiceovers } from './voiceover.service.js';
import { assembleVideo } from './video-assembly.service.js';
import { downloadToLocal } from '../storage/local.storage.js';
import type { VideoScript } from '../schemas/video-script.schema.js';
import { logger } from '../utils/logger.js';

export interface PipelineInput {
  reelId: string;
  content: string;
  style: string;
  voice: string;
  durationTarget: number;
  aspectRatio: string;
}

export interface PipelineResult {
  reelId: string;
  script: VideoScript;
  videoUrl: string;
  localVideoPath: string;
}

export async function runPipeline(
  input: PipelineInput,
  job: Job,
): Promise<PipelineResult> {
  const { reelId, content, style, voice, durationTarget, aspectRatio } = input;
  logger.info({ reelId }, 'Pipeline started');

  // Step 1: Content Analysis
  await job.updateProgress(5);
  await job.updateData({ ...job.data, current_step: 'analyzing' });
  const script = await analyzeContent(content, style, durationTarget);
  await job.updateProgress(30);

  // Step 2: Voiceover Generation
  await job.updateData({ ...job.data, current_step: 'generating_voiceover' });
  const voiceovers = await generateVoiceovers(script, reelId, voice);
  await job.updateProgress(60);

  // Step 3: Video Assembly
  await job.updateData({ ...job.data, current_step: 'assembling_video' });
  const videoUrl = await assembleVideo(script, voiceovers, aspectRatio);
  await job.updateProgress(90);

  // Step 4: Download to local storage
  await job.updateData({ ...job.data, current_step: 'downloading' });
  const localVideoPath = await downloadToLocal(videoUrl, reelId);
  await job.updateProgress(100);

  logger.info({ reelId, localVideoPath }, 'Pipeline complete');
  return { reelId, script, videoUrl, localVideoPath };
}
