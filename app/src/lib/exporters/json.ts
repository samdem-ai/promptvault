import { db } from '../../db/db';
import type { Workspace } from '../../db/schema';

export async function exportWorkspaceJson(workspace: Workspace): Promise<string> {
  const prompts = await db.prompts.where('workspaceId').equals(workspace.id!).filter(p => !p.archived).toArray();
  const result = await Promise.all(prompts.map(async p => {
    const versions = await db.promptVersions.where('promptId').equals(p.id!).sortBy('versionNumber');
    const runs = await db.runs.where('promptId').equals(p.id!).sortBy('createdAt');
    return { ...p, versions, runs };
  }));

  const payload = {
    exportedAt: new Date().toISOString(),
    exportVersion: 1,
    workspace: { name: workspace.name },
    prompts: result,
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
