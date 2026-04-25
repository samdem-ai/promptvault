import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Prompt, PromptStatus } from '../schema';
import type { PromptVersion } from '../schema';
import { fmtPromptId } from '../../lib/idgen';

export interface PromptFilters {
  tags?: string[];
  statuses?: PromptStatus[];
  search?: string;
  archived?: boolean;
  challengeId?: number | null;
}

export function usePrompts(workspaceId: number | null, filters: PromptFilters = {}) {
  const { tags, statuses, search, archived = false, challengeId } = filters;
  return useLiveQuery(async () => {
    if (workspaceId == null) return [];
    let results = await db.prompts.where('workspaceId').equals(workspaceId).toArray();
    results = results.filter(p => p.archived === archived);
    if (challengeId !== undefined) results = results.filter(p => p.challengeId === challengeId);
    if (tags?.length) results = results.filter(p => tags.every(t => p.tags.includes(t)));
    if (statuses?.length) results = results.filter(p => statuses.includes(p.status));
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.promptId.toLowerCase().includes(s) ||
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [workspaceId, tags?.join(), statuses?.join(), search, archived, challengeId]) ?? [];
}

export function usePrompt(id: number | null) {
  return useLiveQuery(() => id != null ? db.prompts.get(id) : undefined, [id]);
}

export function usePromptVersions(promptId: number | null): PromptVersion[] {
  return (useLiveQuery(
    async () => promptId != null ? db.promptVersions.where('promptId').equals(promptId).sortBy('versionNumber') : [],
    [promptId]
  ) ?? []) as PromptVersion[];
}

export function usePromptVersion(id: number | null) {
  return useLiveQuery(() => id != null ? db.promptVersions.get(id) : undefined, [id]);
}

export async function createPrompt(data: Omit<Prompt, 'id' | 'promptId' | 'createdAt' | 'updatedAt' | 'currentVersionId'>, body: string, changeNote = 'Initial version', author = 'researcher'): Promise<number> {
  const now = Date.now();
  return db.transaction('rw', [db.prompts, db.promptVersions], async () => {
    const promptId = await db.prompts.add({
      ...data,
      promptId: 'P-????',
      currentVersionId: null,
      createdAt: now,
      updatedAt: now,
    });
    const formattedId = fmtPromptId(promptId as number);
    const versionId = await db.promptVersions.add({
      promptId: promptId as number,
      versionNumber: 1,
      body,
      changeNote,
      author,
      createdAt: now,
    });
    await db.prompts.update(promptId, { promptId: formattedId, currentVersionId: versionId as number });
    return promptId as number;
  });
}

export async function saveNewVersion(promptId: number, body: string, changeNote: string, author: string): Promise<number> {
  const now = Date.now();
  const existing = await db.promptVersions.where('promptId').equals(promptId).toArray();
  const nextNum = existing.length + 1;
  const versionId = await db.promptVersions.add({ promptId, versionNumber: nextNum, body, changeNote, author, createdAt: now });
  await db.prompts.update(promptId, { currentVersionId: versionId as number, updatedAt: now });
  return versionId as number;
}

export async function updatePromptMeta(id: number, data: Partial<Pick<Prompt, 'title' | 'tags' | 'status' | 'modelLabel' | 'challengeId'>>) {
  return db.prompts.update(id, { ...data, updatedAt: Date.now() });
}

export async function archivePrompt(id: number, reason: string) {
  return db.prompts.update(id, { archived: true, archivedAt: Date.now(), archiveReason: reason, updatedAt: Date.now() });
}

export async function restorePrompt(id: number) {
  return db.prompts.update(id, { archived: false, archivedAt: null, archiveReason: '', updatedAt: Date.now() });
}

export async function deletePromptPermanently(id: number) {
  await db.transaction('rw', [db.prompts, db.promptVersions, db.runs], async () => {
    await db.promptVersions.where('promptId').equals(id).delete();
    await db.runs.where('promptId').equals(id).delete();
    await db.prompts.delete(id);
  });
}

export async function forkPrompt(id: number, author: string): Promise<number> {
  const prompt = await db.prompts.get(id);
  if (!prompt) throw new Error('Prompt not found');
  const currentVersion = prompt.currentVersionId ? await db.promptVersions.get(prompt.currentVersionId) : null;
  return createPrompt(
    {
      workspaceId: prompt.workspaceId,
      challengeId: prompt.challengeId,
      title: prompt.title + ' (fork)',
      tags: [...prompt.tags],
      status: 'untested' as PromptStatus,
      modelLabel: prompt.modelLabel,
      author,
      archived: false,
      archivedAt: null,
      archiveReason: '',
    },
    currentVersion?.body ?? '',
    `Forked from ${prompt.promptId}`,
    author
  );
}
