import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Workspace } from '../schema';

export function useWorkspaces() {
  return useLiveQuery(() => db.workspaces.orderBy('name').toArray(), []) ?? [];
}

export function useWorkspace(id: number | null) {
  return useLiveQuery(
    () => id != null ? db.workspaces.get(id) : undefined,
    [id]
  );
}

export async function createWorkspace(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  return db.workspaces.add({ ...data, createdAt: now, updatedAt: now });
}

export async function updateWorkspace(id: number, data: Partial<Workspace>) {
  return db.workspaces.update(id, { ...data, updatedAt: Date.now() });
}

export async function deleteWorkspace(id: number) {
  await db.transaction('rw', [db.workspaces, db.prompts, db.promptVersions, db.runs, db.challenges, db.imports], async () => {
    const promptIds = (await db.prompts.where('workspaceId').equals(id).primaryKeys()) as number[];
    await db.promptVersions.where('promptId').anyOf(promptIds).delete();
    await db.runs.where('workspaceId').equals(id).delete();
    await db.prompts.where('workspaceId').equals(id).delete();
    await db.challenges.where('workspaceId').equals(id).delete();
    await db.imports.where('workspaceId').equals(id).delete();
    await db.workspaces.delete(id);
  });
}
