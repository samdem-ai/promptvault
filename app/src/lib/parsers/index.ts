import { parseChatGPT } from './chatgpt';
import { parseClaude } from './claude';
import { parsePlaintext, parseRawJson } from './plaintext';
export type { ParsedPrompt, ParseResult } from './types';

export type Format = 'chatgpt' | 'claude' | 'raw-json' | 'markdown';

export function detectFormat(raw: string): Format {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const first = arr[0];
      if (first?.mapping) return 'chatgpt';
      if (first?.chat_messages || first?.uuid || first?.sender) return 'claude';
      return 'raw-json';
    } catch {}
  }
  return 'markdown';
}

export function parseAny(raw: string, format?: Format) {
  const fmt = format ?? detectFormat(raw);
  switch (fmt) {
    case 'chatgpt':  return parseChatGPT(raw);
    case 'claude':   return parseClaude(raw);
    case 'raw-json': return parseRawJson(raw);
    default:         return parsePlaintext(raw);
  }
}
