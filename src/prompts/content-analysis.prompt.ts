export const SYSTEM_PROMPT = `You are a short-form video scriptwriter specializing in Instagram Reels and YouTube Shorts. You create scripts that are:
- Hook-driven: The first 2 seconds must grab attention
- Visual: Every scene has a clear visual description
- Concise: Each scene's narration fits naturally into the allocated time
- Engaging: Use conversational tone, not robotic

You output structured video scripts as JSON matching the provided schema.`;

export function buildUserPrompt(
  content: string,
  style: string,
  durationTarget: number,
): string {
  const wordBudget = Math.round(durationTarget * 2.5);
  const minScenes = Math.ceil(durationTarget / 8);
  const maxScenes = Math.ceil(durationTarget / 4);

  return `Create a ${durationTarget}-second ${style} video script about the following topic:

"${content}"

Rules:
- The hook scene (first scene) must be 2-4 seconds and pose a question or make a bold claim
- Each subsequent scene should be 4-8 seconds
- Total narration when read aloud should fit within ${durationTarget} seconds (~${wordBudget} words total)
- scene_narration is what will be spoken aloud (TTS)
- visual_description describes what the viewer sees (used to select/generate background visuals)
- text_overlay is short text shown on screen (max 8 words per scene)
- The last scene should be a callToAction (like, follow, subscribe, etc.)
- Aim for ${minScenes} to ${maxScenes} scenes total
- total_estimated_duration_seconds should equal the sum of all scene durations`;
}
