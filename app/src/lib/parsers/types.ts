export interface ParsedPrompt {
  title: string;
  body: string;
  modelLabel: string;
  tags: string[];
}

export interface ParseResult {
  prompts: ParsedPrompt[];
  errors: string[];
}
