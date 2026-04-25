import type { ParseResult } from './types';

export function parsePlaintext(raw: string): ParseResult {
  const chunks = raw.split(/\n(?:---|[*]{3})\n/).map(s => s.trim()).filter(Boolean);
  const prompts = chunks.map((chunk, i) => {
    const lines = chunk.split('\n').filter(Boolean);
    const firstLine = lines[0] || '';
    const title = firstLine.replace(/^[#*\->\s]+/, '').slice(0, 80) || `Untitled prompt ${i + 1}`;
    return { title, body: chunk, modelLabel: '', tags: [] };
  });
  return { prompts, errors: [] };
}

export function parseRawJson(raw: string): ParseResult {
  try {
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : [data];
    const prompts = arr.map((item: any, i: number) => {
      if (typeof item === 'string') {
        const lines = item.split('\n').filter(Boolean);
        return { title: lines[0]?.slice(0, 80) || `Prompt ${i + 1}`, body: item, modelLabel: '', tags: [] };
      }
      return {
        title: item.title || item.name || `Prompt ${i + 1}`,
        body: item.body || item.content || item.prompt || JSON.stringify(item),
        modelLabel: item.model || item.modelLabel || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
      };
    });
    return { prompts, errors: [] };
  } catch (e) {
    return { prompts: [], errors: [`JSON parse error: ${e}`] };
  }
}
