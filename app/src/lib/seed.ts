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
  { name: 'wave-0',         color: 'oklch(0.70 0.06 270)', description: 'Wave 0 warm-up challenges' },
  { name: 'wave-1',         color: 'oklch(0.55 0.14 145)', description: 'Wave 1 challenges' },
  { name: 'wave-2',         color: 'oklch(0.55 0.15 25)',  description: 'Wave 2 challenges' },
  { name: 'relay',          color: 'oklch(0.74 0.13 35)',  description: '"Relay as-is" indirect injection' },
  { name: 'extraction',     color: 'oklch(0.75 0.13 305)', description: 'Data or credential extraction' },
  { name: 'injection',      color: 'oklch(0.74 0.13 235)', description: 'SQL or prompt injection' },
  { name: 'hijack',         color: 'oklch(0.72 0.15 0)',   description: 'Account or address hijacking' },
  { name: 'business-logic', color: 'oklch(0.78 0.13 85)',  description: 'Voucher, refund, order manipulation' },
  { name: 'handoff',        color: 'oklch(0.78 0.10 145)', description: 'Human handoff manipulation' },
  { name: 'harmful',        color: 'oklch(0.66 0.18 25)',  description: 'Self-harm or disinformation content' },
  { name: 'multi-turn',     color: 'oklch(0.75 0.12 200)', description: 'Multi-turn attack sequences' },
  { name: 'account',        color: 'oklch(0.74 0.13 320)', description: 'Account takeover or enumeration' },
  { name: 'ticket',         color: 'oklch(0.70 0.06 270)', description: 'Support ticket manipulation' },
  { name: 'address',        color: 'oklch(0.55 0.13 200)', description: 'Delivery address attacks' },
  { name: 'document',       color: 'oklch(0.70 0.10 60)',  description: 'Internal document extraction' },
  { name: 'persona',        color: 'oklch(0.72 0.15 290)', description: 'Persona or role-play jailbreak' },
  { name: 'encoding',       color: 'oklch(0.74 0.13 180)', description: 'Encoded or obfuscated payloads' },
  { name: 'fiction',        color: 'oklch(0.70 0.10 50)',  description: 'Fictional framing / story wrapper' },
];

function getWaveTag(wave: string): string {
  if (wave.includes('0')) return 'wave-0';
  if (wave.includes('2')) return 'wave-2';
  return 'wave-1';
}

function deriveTags(entry: GsEntry): string[] {
  const b = entry.behavior_name.toLowerCase();
  const allText = entry.conversation.map(m => m.content || '').join(' ').toLowerCase();
  const tags: string[] = [getWaveTag(entry.wave)];

  if (allText.includes('relay') && (allText.includes('as is') || allText.includes('exactly'))) tags.push('relay');
  if (b.includes('sql') || allText.includes('union select') || allText.includes("' or ")) tags.push('injection');
  if (b.includes('extract') || b.includes('leak') || b.includes('enumeration') || b.includes('exfiltrate')) tags.push('extraction');
  if (b.includes('hijack') || b.includes('redirect') || b.includes('steal') || b.includes('takeover')) tags.push('hijack');
  if (b.includes('voucher') || b.includes('refund') || b.includes('duplicate') || b.includes('inflate') ||
      b.includes('cancellation') || b.includes('cancel') || b.includes('force') || b.includes('wire fraud') ||
      b.includes('pump') || b.includes('shell company')) tags.push('business-logic');
  if (b.includes('handoff') || b.includes('hand-off')) tags.push('handoff');
  if (b.includes('self-harm') || b.includes('disinformation') || b.includes('radicalization') ||
      b.includes('ethnic tension') || b.includes('lsd') || b.includes('methamphetamine') ||
      b.includes('make a gun')) tags.push('harmful');
  if (b.includes('account') || b.includes('email') || b.includes('sim swap')) tags.push('account');
  if (b.includes('ticket') || b.includes('sanitize')) tags.push('ticket');
  if (b.includes('address')) tags.push('address');
  if (b.includes('document') || b.includes('internal') || b.includes('macro') || b.includes('word doc')) tags.push('document');
  if (allText.includes('character') || allText.includes('roleplay') || allText.includes('role-play') ||
      allText.includes('persona') || allText.includes('you are') || allText.includes('pretend')) tags.push('persona');
  if (allText.includes('base64') || allText.includes('rot13') || allText.includes('encode') ||
      allText.includes('cipher') || allText.includes('obfuscat')) tags.push('encoding');
  if (allText.includes('story') || allText.includes('novel') || allText.includes('fiction') ||
      allText.includes('script') || allText.includes('thriller') || allText.includes('movie')) tags.push('fiction');

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

function getSafeguardsPriority(behavior: string): 'P0' | 'P1' | 'P2' | 'P3' {
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

function getStagedPriority(behavior: string): 'P0' | 'P1' | 'P2' | 'P3' {
  const b = behavior.toLowerCase();
  if (b.includes('lsd') || b.includes('methamphetamine') || b.includes('make a gun') ||
      b.includes('radicalization') || b.includes('ethnic tension') || b.includes('ehr')) return 'P0';
  if (b.includes('exfiltrate') || b.includes('sim swap') || b.includes('macro') ||
      b.includes('wire fraud')) return 'P1';
  if (b.includes('pump') || b.includes('shell company') || b.includes('xray')) return 'P2';
  return 'P3';
}

async function seedWorkspace(
  wsId: number,
  entries: GsEntry[],
  getPriority: (b: string) => 'P0' | 'P1' | 'P2' | 'P3',
  importLabel: string,
) {
  const behaviorMap = new Map<string, { criteria: string; priority: 'P0'|'P1'|'P2'|'P3' }>();
  entries.forEach(e => {
    if (!behaviorMap.has(e.behavior_name))
      behaviorMap.set(e.behavior_name, { criteria: e.behavior_criteria, priority: getPriority(e.behavior_name) });
  });

  const challengeIdMap = new Map<string, number>();
  for (const [name, meta] of behaviorMap) {
    const id = await createChallenge({ workspaceId: wsId, title: name, description: meta.criteria, priority: meta.priority });
    challengeIdMap.set(name, id);
  }

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
          promptId: 'P-????', workspaceId: wsId, challengeId, title,
          currentVersionId: null, tags, status: 'bypassed' as PromptStatus,
          modelLabel: entry.model_name, author: 'grayswan',
          archived: false, archivedAt: null, archiveReason: '',
          createdAt: now, updatedAt: now,
        });
        await db.prompts.update(pRowId, { promptId: fmtPromptId(pRowId as number) });

        const vRowId = await db.promptVersions.add({
          promptId: pRowId as number, versionNumber: 1, body,
          changeNote: importLabel, author: 'grayswan', createdAt: now,
        });
        await db.prompts.update(pRowId, { currentVersionId: vRowId as number });

        const rRowId = await db.runs.add({
          runId: 'R-????', promptId: pRowId as number, versionId: vRowId as number,
          workspaceId: wsId, challengeId, status: 'bypassed' as PromptStatus,
          notes: `Submission ${entry.submission_id}`, duration: '', createdAt: now,
        });
        await db.runs.update(rRowId, { runId: fmtRunId(rRowId as number) });
      }
    });
  }
}

export async function seedDatabase() {
  for (const tag of GS_TAGS) await createTag(tag);

  // Workspace 1: Safeguards (365 entries)
  const [safeguardsRes, stagedRes] = await Promise.all([
    fetch('/safeguards.json'),
    fetch('/staged-attacks.json'),
  ]);
  const safeguardsEntries: GsEntry[] = await safeguardsRes.json();
  const stagedEntries: GsEntry[] = await stagedRes.json();

  const ws1 = await createWorkspace({
    name: 'Gray Swan · Safeguards',
    color: 'oklch(0.45 0.13 280)',
    systemPromptNotes: 'Whitfield e-commerce customer support agent — orders, vouchers, refunds, address management, human handoff.',
  });
  await seedWorkspace(ws1, safeguardsEntries, getSafeguardsPriority, 'Imported from Gray Swan Safeguards Arena');

  // Workspace 2: Staged Attacks (325 successful entries)
  const ws2 = await createWorkspace({
    name: 'Gray Swan · Staged Attacks',
    color: 'oklch(0.55 0.15 25)',
    systemPromptNotes: 'Direct LLM jailbreaks — Wave 1 and Wave 2 staged attack challenges.',
  });
  await seedWorkspace(ws2, stagedEntries, getStagedPriority, 'Imported from Gray Swan Staged Attacks Arena');
}
