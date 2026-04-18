import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { Job } from 'bullmq';
import { reelQueue } from '../jobs/queue.js';
import { config } from '../config/index.js';
import { generateReelId } from '../utils/id.js';
import type { ReelRequest } from '../schemas/reel-request.schema.js';

export async function createReel(req: Request, res: Response): Promise<void> {
  const body = req.body as ReelRequest;
  const reelId = generateReelId();

  await reelQueue.add(reelId, {
    reelId,
    content: body.content,
    style: body.style,
    voice: body.voice,
    durationTarget: body.duration_target,
    aspectRatio: body.aspect_ratio,
    current_step: 'queued',
  });

  res.status(202).json({
    id: reelId,
    status: 'queued',
    created_at: new Date().toISOString(),
    status_url: `/api/reels/${reelId}/status`,
  });
}

export async function getReelStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  // Find the job by name (reelId is used as the job name)
  const jobs = await reelQueue.getJobs([
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed',
  ]);
  const job = jobs.find((j) => j.data?.reelId === id);

  if (!job) {
    res.status(404).json({ error: 'Reel not found' });
    return;
  }

  const state = await job.getState();
  const progress = job.progress as number;

  if (state === 'completed') {
    const result = job.returnvalue;
    res.json({
      id,
      status: 'completed',
      progress: 100,
      download_url: `/api/reels/${id}/download`,
      script: result?.script,
      video_url: result?.videoUrl,
      created_at: new Date(job.timestamp).toISOString(),
      completed_at: result ? new Date().toISOString() : undefined,
    });
    return;
  }

  if (state === 'failed') {
    res.json({
      id,
      status: 'failed',
      error: job.failedReason ?? 'Unknown error',
      failed_step: job.data?.current_step,
      created_at: new Date(job.timestamp).toISOString(),
    });
    return;
  }

  res.json({
    id,
    status: state === 'active' ? 'processing' : 'queued',
    progress: progress ?? 0,
    current_step: job.data?.current_step ?? 'queued',
    created_at: new Date(job.timestamp).toISOString(),
  });
}

export async function downloadReel(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const videoPath = path.resolve(config.OUTPUT_DIR, 'video', `${id}.mp4`);

  if (!fs.existsSync(videoPath)) {
    res.status(404).json({ error: 'Video not found. It may still be processing.' });
    return;
  }

  res.download(videoPath, `${id}.mp4`);
}
