import type { ParseResult } from './types';

export function parseClaude(raw: string): ParseResult {
  const errors: string[] = [];
  try {
    const data = JSON.parse(raw);
    const conversations = Array.isArray(data) ? data : [data];
    const prompts = conversations.flatMap((conv: any) => {
      try {
        const title = conv.name || conv.title || 'Untitled conversation';
        const messages = conv.chat_messages || conv.messages || [];
        const firstHuman = messages.find((m: any) => m.sender === 'human' || m.role === 'user');
        if (!firstHuman) return [];
        const body = typeof firstHuman.text === 'string'
          ? firstHuman.text
          : firstHuman.content?.[0]?.text || '';
        return [{ title: title.slice(0, 80), body, modelLabel: '', tags: [] }];
      } catch (e) {
        errors.push(`Failed to parse conversation: ${e}`);
        return [];
      }
    });
    return { prompts, errors };
  } catch (e) {
    return { prompts: [], errors: [`Claude parse error: ${e}`] };
  }
}
