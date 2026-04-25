import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Run, PromptStatus } from '../schema';
import { fmtRunId } from '../../lib/idgen';

export function useRuns(workspaceId: number | null, promptId?: number | null) {
  return useLiveQuery(async () => {
    if (workspaceId == null) return [];
    let results: Run[];
    if (promptId != null) {
      results = await db.runs.where('promptId').equals(promptId).toArray();
    } else {
      results = await db.runs.where('workspaceId').equals(workspaceId).toArray();
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }, [workspaceId, promptId]) ?? [];
}

export function useRun(id: number | null) {
  return useLiveQuery(() => id != null ? db.runs.get(id) : undefined, [id]);
}

export async function createRun(data: Omit<Run, 'id' | 'runId' | 'createdAt'>): Promise<number> {
  const now = Date.now();
  const runId = await db.runs.add({ ...data, runId: 'R-????', createdAt: now });
  const formatted = fmtRunId(runId as number);
  await db.runs.update(runId, { runId: formatted });
  await db.prompts.update(data.promptId, { status: data.status, updatedAt: now });
  return runId as number;
}

export async function updateRunStatus(id: number, status: PromptStatus, promptId: number) {
  await db.runs.update(id, { status });
  const latestRun = await db.runs.where('promptId').equals(promptId).sortBy('createdAt');
  if (latestRun[latestRun.length - 1]?.id === id) {
    await db.prompts.update(promptId, { status, updatedAt: Date.now() });
  }
}

export async function deleteRun(id: number) {
  return db.runs.delete(id);
}
