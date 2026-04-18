import { nanoid } from 'nanoid';

export function generateReelId(): string {
  return `rl_${nanoid(16)}`;
}
