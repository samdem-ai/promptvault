import Dexie, { type Table } from 'dexie';
import type { Workspace, Tag, Challenge, Prompt, PromptVersion, Run, ImportLog } from './schema';

class InjectDB extends Dexie {
  workspaces!: Table<Workspace>;
  tags!: Table<Tag>;
  challenges!: Table<Challenge>;
  prompts!: Table<Prompt>;
  promptVersions!: Table<PromptVersion>;
  runs!: Table<Run>;
  imports!: Table<ImportLog>;

  constructor() {
    super('inject-dev');
    this.version(1).stores({
      workspaces:    '++id, name, updatedAt',
      tags:          '++id, &name',
      challenges:    '++id, challengeId, workspaceId, priority',
      prompts:       '++id, promptId, workspaceId, challengeId, status, archived, updatedAt, *tags',
      promptVersions:'++id, promptId, versionNumber',
      runs:          '++id, runId, promptId, workspaceId, status, createdAt',
      imports:       '++id, importId, workspaceId, createdAt',
    });
  }
}

export const db = new InjectDB();
