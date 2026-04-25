import { db } from '../../db/db';
import type { Workspace } from '../../db/schema';

export async function exportWorkspaceMarkdown(workspace: Workspace): Promise<string> {
  const prompts = await db.prompts.where('workspaceId').equals(workspace.id!).filter(p => !p.archived).toArray();
  const now = new Date().toISOString().split('T')[0];

  const total = prompts.length;
  const bypassed = prompts.filter(p => p.status === 'bypassed').length;
  const partial  = prompts.filter(p => p.status === 'partial').length;
  const blocked  = prompts.filter(p => p.status === 'blocked').length;
  const pct = total ? Math.round(bypassed / total * 100) : 0;

  let md = `# inject.dev Export — ${workspace.name}\n_Exported ${now}_\n\n`;
  md += `## Summary\n- ${total} prompts · ${bypassed} bypassed (${pct}%) · ${partial} partial · ${blocked} blocked\n\n`;
  md += `## Prompts\n\n`;

  for (const p of prompts.sort((a, b) => b.updatedAt - a.updatedAt)) {
    const currentVersion = p.currentVersionId ? await db.promptVersions.get(p.currentVersionId) : null;
    const runs = await db.runs.where('promptId').equals(p.id!).sortBy('createdAt');
    md += `### ${p.promptId} · ${p.title}\n`;
    md += `**Status:** ${p.status}  **Model:** ${p.modelLabel || '—'}  **Tags:** ${p.tags.join(', ') || '—'}\n\n`;
    if (currentVersion?.body) {
      md += `\`\`\`\n${currentVersion.body}\n\`\`\`\n\n`;
    }
    if (runs.length) {
      md += `**Runs:** ${runs.length} total · last: ${runs[runs.length - 1].status}\n`;
    }
    md += '\n---\n\n';
  }

  return md;
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
