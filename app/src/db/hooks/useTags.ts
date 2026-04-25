import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Tag } from '../schema';

export interface TagWithStats extends Tag {
  count: number;
  bypassed: number;
  partial: number;
  blocked: number;
}

export function useTags() {
  return useLiveQuery(() => db.tags.orderBy('name').toArray(), []) ?? [];
}

export function useTagsWithStats(workspaceId: number | null): TagWithStats[] {
  return useLiveQuery(async () => {
    const tags = await db.tags.orderBy('name').toArray();
    if (workspaceId == null) return tags.map(t => ({ ...t, count: 0, bypassed: 0, partial: 0, blocked: 0 }));

    const prompts = await db.prompts
      .where('workspaceId').equals(workspaceId)
      .filter(p => !p.archived)
      .toArray();

    return tags.map(t => {
      const tagged = prompts.filter(p => p.tags.includes(t.name));
      return {
        ...t,
        count: tagged.length,
        bypassed: tagged.filter(p => p.status === 'bypassed').length,
        partial:  tagged.filter(p => p.status === 'partial').length,
        blocked:  tagged.filter(p => p.status === 'blocked').length,
      };
    });
  }, [workspaceId]) ?? [];
}

export async function createTag(data: Omit<Tag, 'id'>) {
  return db.tags.add(data);
}

export async function updateTag(id: number, data: Partial<Tag>) {
  return db.tags.update(id, data);
}

export async function deleteTag(id: number) {
  return db.tags.delete(id);
}
