import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { config } from '../config/index.js';
import { VideoScriptSchema, type VideoScript } from '../schemas/video-script.schema.js';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/content-analysis.prompt.js';
import { logger } from '../utils/logger.js';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export async function analyzeContent(
  content: string,
  style: string,
  durationTarget: number,
): Promise<VideoScript> {
  logger.info({ content, style, durationTarget }, 'Analyzing content with Claude');

  const message = await client.messages.parse({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(content, style, durationTarget) },
    ],
    output_config: {
      format: zodOutputFormat(VideoScriptSchema),
    },
  });

  const script = message.parsed_output;
  if (!script) {
    throw new Error('Claude returned no parsed output');
  }

  logger.info(
    { title: script.title, sceneCount: script.scenes.length },
    'Content analysis complete',
  );

  return script;
}
