import type { ParseResult } from './types';

export function parseChatGPT(raw: string): ParseResult {
  const errors: string[] = [];
  try {
    const data = JSON.parse(raw);
    const conversations = Array.isArray(data) ? data : [data];
    const prompts = conversations.flatMap((conv: any) => {
      try {
        const title = conv.title || 'Untitled conversation';
        const model = conv.default_model_slug || conv.model_slug || '';
        const mapping = conv.mapping || {};
        const nodes = Object.values(mapping) as any[];
        const userMessages = nodes
          .filter(n => n?.message?.author?.role === 'user' && n?.message?.content?.parts)
          .map(n => {
            const parts = n.message.content.parts;
            return Array.isArray(parts) ? parts.filter(Boolean).join('\n') : String(parts);
          })
          .filter(Boolean);

        if (!userMessages.length) return [];
        return [{
          title: title.slice(0, 80),
          body: userMessages[0],
          modelLabel: model,
          tags: [],
        }];
      } catch (e) {
        errors.push(`Failed to parse conversation: ${e}`);
        return [];
      }
    });
    return { prompts, errors };
  } catch (e) {
    return { prompts: [], errors: [`ChatGPT parse error: ${e}`] };
  }
}
