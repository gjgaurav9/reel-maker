import { z } from 'zod';

export const ReelRequestSchema = z.object({
  content: z.string().min(3, 'Content must be at least 3 characters'),
  style: z
    .enum(['educational', 'storytelling', 'listicle', 'motivational'])
    .default('educational'),
  voice: z
    .enum([
      'alloy', 'ash', 'ballad', 'coral', 'echo',
      'fable', 'nova', 'onyx', 'sage', 'shimmer',
    ])
    .default('nova'),
  duration_target: z.coerce.number().min(15).max(60).default(30),
  aspect_ratio: z.enum(['9:16', '1:1', '16:9']).default('9:16'),
});

export type ReelRequest = z.infer<typeof ReelRequestSchema>;
