import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ImportLog } from '../schema';
import { fmtImportId } from '../../lib/idgen';

export function useImports(workspaceId: number | null) {
  return useLiveQuery(async () => {
    if (workspaceId == null) return [];
    return db.imports.where('workspaceId').equals(workspaceId).sortBy('createdAt').then(r => r.reverse());
  }, [workspaceId]) ?? [];
}

export async function createImportLog(data: Omit<ImportLog, 'id' | 'importId' | 'createdAt'>): Promise<number> {
  const now = Date.now();
  const id = await db.imports.add({ ...data, importId: 'IMP-???', createdAt: now });
  await db.imports.update(id, { importId: fmtImportId(id as number) });
  return id as number;
}
