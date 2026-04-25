import { createWorkspace } from '../db/hooks/useWorkspaces';
import { createTag } from '../db/hooks/useTags';
import { createChallenge } from '../db/hooks/useChallenges';
import { db } from '../db/db';
import { fmtPromptId, fmtRunId } from './idgen';
import type { PromptStatus } from '../db/schema';

type GsConvMsg = { role: string; content: string; order: number };
type GsEntry = {
  submission_id: string;
  model_name: string;
  behavior_name: string;
  behavior_criteria: string;
  wave: string;
  conversation: GsConvMsg[];
};

const GS_TAGS = [
  { name: 'wave-0',        color: 'oklch(0.70 0.06 270)', description: 'Wave 0 warm-up challenges' },
  { name: 'wave-1',        color: 'oklch(0.55 0.14 145)', description: 'Wave 1 challenges' },
  { name: 'relay',         color: 'oklch(0.74 0.13 35)',  description: '"Relay as-is" indirect injection' },
  { name: 'extraction',    color: 'oklch(0.75 0.13 305)', description: 'Data or voucher extraction' },
  { name: 'injection',     color: 'oklch(0.74 0.13 235)', description: 'SQL or prompt injection' },
  { name: 'hijack',        color: 'oklch(0.72 0.15 0)',   description: 'Account or address hijacking' },
  { name: 'business-logic',color: 'oklch(0.78 0.13 85)',  description: 'Voucher, refund, order manipulation' },
  { name: 'handoff',       color: 'oklch(0.78 0.10 145)', description: 'Human handoff manipulation' },
  { name: 'harmful',       color: 'oklch(0.66 0.18 25)',  description: 'Self-harm or disinformation content' },
  { name: 'multi-turn',    color: 'oklch(0.75 0.12 200)', description: 'Multi-turn attack sequences' },
  { name: 'account',       color: 'oklch(0.74 0.13 320)', description: 'Account takeover or enumeration' },
  { name: 'ticket',        color: 'oklch(0.70 0.06 270)', description: 'Support ticket manipulation' },
  { name: 'address',       color: 'oklch(0.55 0.13 200)', description: 'Delivery address attacks' },
  { name: 'document',      color: 'oklch(0.70 0.10 60)',  description: 'Internal document extraction' },
];

function getWaveTag(wave: string): string {
  return wave.includes('0') ? 'wave-0' : 'wave-1';
}

function deriveTags(entry: GsEntry): string[] {
  const b = entry.behavior_name.toLowerCase();
  const allText = entry.conversation.map(m => m.content || '').join(' ').toLowerCase();
  const tags: string[] = [getWaveTag(entry.wave)];

  if (allText.includes('relay') && (allText.includes('as is') || allText.includes('exactly'))) tags.push('relay');
  if (b.includes('sql') || allText.includes('union select') || allText.includes("' or ")) tags.push('injection');
  if (b.includes('extract') || b.includes('leak') || b.includes('enumeration') || b.includes('voucher code')) tags.push('extraction');
  if (b.includes('hijack') || b.includes('redirect') || b.includes('steal') || b.includes('takeover')) tags.push('hijack');
  if (b.includes('voucher') || b.includes('refund') || b.includes('duplicate') || b.includes('inflate') || b.includes('cancellation') || b.includes('cancel') || b.includes('force')) tags.push('business-logic');
  if (b.includes('handoff') || b.includes('hand-off') || b.includes('handoff')) tags.push('handoff');
  if (b.includes('self-harm') || b.includes('disinformation')) tags.push('harmful');
  if (b.includes('account') || b.includes('email')) tags.push('account');
  if (b.includes('ticket') || b.includes('sanitize')) tags.push('ticket');
  if (b.includes('address')) tags.push('address');
  if (b.includes('document') || b.includes('internal')) tags.push('document');

  const userTurns = entry.conversation.filter(m => m.role === 'user').length;
  if (userTurns > 2) tags.push('multi-turn');

  return [...new Set(tags)];
}

function buildBody(entry: GsEntry): string {
  const userMsgs = entry.conversation.filter(m => m.role === 'user');
  if (userMsgs.length === 1) return userMsgs[0].content;
  return userMsgs.map((m, i) => `[Turn ${i + 1}]\n${m.content}`).join('\n\n');
}

function buildTitle(entry: GsEntry): string {
  const first = entry.conversation.find(m => m.role === 'user')?.content ?? '';
  const preview = first.replace(/\n/g, ' ').slice(0, 55).trim();
  return `${entry.model_name} — ${preview}${first.length > 55 ? '…' : ''}`;
}

function getPriority(behavior: string): 'P0' | 'P1' | 'P2' | 'P3' {
  const b = behavior.toLowerCase();
  if (b.includes('self-harm') || b.includes('disinformation') || b.includes('sql') ||
      b.includes('steal account') || b.includes('account takeover') ||
      b.includes('extract') || b.includes('leak internal') || b.includes('hijack another')) return 'P0';
  if (b.includes('hijack') || b.includes('manipulate hand') || b.includes('redirect') ||
      b.includes('corrupt') || b.includes('steal refund') || b.includes('sanitize')) return 'P1';
  if (b.includes('voucher') || b.includes('refund') || b.includes('duplicate') ||
      b.includes('force') || b.includes('inflate') || b.includes('ticket')) return 'P2';
  return 'P3';
}

export async function seedDatabase() {
  const res = await fetch('/safeguards.json');
  const entries: GsEntry[] = await res.json();

  const wsId = await createWorkspace({
    name: 'Gray Swan · Safeguards',
    color: 'oklch(0.45 0.13 280)',
    systemPromptNotes: 'Whitfield e-commerce customer support agent — handles orders, vouchers, refunds, address management, and human handoff.',
  });

  for (const tag of GS_TAGS) await createTag(tag);

  // Build unique challenges
  const behaviorMap = new Map<string, { criteria: string; priority: 'P0'|'P1'|'P2'|'P3' }>();
  entries.forEach(e => {
    if (!behaviorMap.has(e.behavior_name)) {
      behaviorMap.set(e.behavior_name, { criteria: e.behavior_criteria, priority: getPriority(e.behavior_name) });
    }
  });

  const challengeIdMap = new Map<string, number>();
  for (const [name, meta] of behaviorMap) {
    const id = await createChallenge({
      workspaceId: wsId,
      title: name,
      description: meta.criteria,
      priority: meta.priority,
    });
    challengeIdMap.set(name, id);
  }

  // Bulk-insert all prompts + versions + runs in batched transactions
  const BATCH = 25;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    await db.transaction('rw', [db.prompts, db.promptVersions, db.runs], async () => {
      const now = Date.now();
      for (const entry of batch) {
        const tags = deriveTags(entry);
        const body = buildBody(entry);
        const title = buildTitle(entry);
        const challengeId = challengeIdMap.get(entry.behavior_name) ?? null;

        const pRowId = await db.prompts.add({
          promptId: 'P-????',
          workspaceId: wsId,
          challengeId,
          title,
          currentVersionId: null,
          tags,
          status: 'bypassed' as PromptStatus,
          modelLabel: entry.model_name,
          author: 'grayswan',
          archived: false,
          archivedAt: null,
          archiveReason: '',
          createdAt: now,
          updatedAt: now,
        });
        await db.prompts.update(pRowId, { promptId: fmtPromptId(pRowId as number) });

        const vRowId = await db.promptVersions.add({
          promptId: pRowId as number,
          versionNumber: 1,
          body,
          changeNote: 'Imported from Gray Swan Arena',
          author: 'grayswan',
          createdAt: now,
        });
        await db.prompts.update(pRowId, { currentVersionId: vRowId as number });

        const rRowId = await db.runs.add({
          runId: 'R-????',
          promptId: pRowId as number,
          versionId: vRowId as number,
          workspaceId: wsId,
          challengeId,
          status: 'bypassed' as PromptStatus,
          notes: `Submission ${entry.submission_id}`,
          duration: '',
          createdAt: now,
        });
        await db.runs.update(rRowId, { runId: fmtRunId(rRowId as number) });
      }
    });
  }
}
