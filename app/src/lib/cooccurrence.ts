import type { Prompt } from '../db/schema';

export function computeCoOccurrence(prompts: Prompt[], targetTag: string) {
  const counts: Record<string, number> = {};
  for (const p of prompts) {
    if (!p.tags.includes(targetTag)) continue;
    for (const t of p.tags) {
      if (t === targetTag) continue;
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
