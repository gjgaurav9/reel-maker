import { z } from 'zod';

export const SceneSchema = z.object({
  scene_number: z.number().int().min(1),
  scene_type: z.enum(['hook', 'content', 'callToAction']),
  duration_seconds: z.number().min(2).max(15),
  scene_narration: z.string().describe('Text spoken aloud by TTS voice'),
  visual_description: z
    .string()
    .describe('Description of the background visual for this scene'),
  text_overlay: z
    .string()
    .max(60)
    .describe('Short text shown on screen, max 8 words'),
  text_position: z.enum(['top', 'center', 'bottom']),
  transition: z.enum(['cut', 'fade', 'slide']).default('cut'),
});

export const VideoScriptSchema = z.object({
  title: z.string().max(100),
  scenes: z.array(SceneSchema).min(2).max(12),
  total_estimated_duration_seconds: z.number(),
  mood: z.string().describe('Overall mood keyword, e.g. energetic, calm, dark, warm'),
  background_music_suggestion: z
    .string()
    .describe('Genre/tempo suggestion for background music'),
});

export type VideoScript = z.infer<typeof VideoScriptSchema>;
export type Scene = z.infer<typeof SceneSchema>;
