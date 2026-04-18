import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  BASE_URL: z.string().url().default('http://localhost:3000'),

  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  CREATOMATE_API_KEY: z.string().min(1, 'CREATOMATE_API_KEY is required'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  OUTPUT_DIR: z.string().default('./output'),
  DEFAULT_VOICE: z.string().default('nova'),
  DEFAULT_DURATION: z.coerce.number().default(30),
  DEFAULT_ASPECT_RATIO: z.enum(['9:16', '1:1', '16:9']).default('9:16'),
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);
