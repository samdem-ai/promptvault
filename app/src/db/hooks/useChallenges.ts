import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Challenge } from '../schema';
import { fmtChallengeId } from '../../lib/idgen';

export interface ChallengeWithStats extends Challenge {
  total: number;
  blocked: number;
  partial: number;
  bypassed: number;
  untested: number;
}

export function useChallenges(workspaceId: number | null): ChallengeWithStats[] {
  return useLiveQuery(async () => {
    if (workspaceId == null) return [];
    const challenges = await db.challenges.where('workspaceId').equals(workspaceId).toArray();
    const prompts = await db.prompts.where('workspaceId').equals(workspaceId).filter(p => !p.archived).toArray();

    return challenges.map(c => {
      const cps = prompts.filter(p => p.challengeId === c.id);
      return {
        ...c,
        total:    cps.length,
        blocked:  cps.filter(p => p.status === 'blocked').length,
        partial:  cps.filter(p => p.status === 'partial').length,
        bypassed: cps.filter(p => p.status === 'bypassed').length,
        untested: cps.filter(p => p.status === 'untested').length,
      };
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [workspaceId]) ?? [];
}

export async function createChallenge(data: Omit<Challenge, 'id' | 'challengeId' | 'createdAt' | 'updatedAt'> & { description?: string }): Promise<number> {
  const now = Date.now();
  const id = await db.challenges.add({ ...data, challengeId: 'C-???', createdAt: now, updatedAt: now });
  await db.challenges.update(id, { challengeId: fmtChallengeId(id as number) });
  return id as number;
}

export async function updateChallenge(id: number, data: Partial<Pick<Challenge, 'title' | 'priority'>>) {
  return db.challenges.update(id, { ...data, updatedAt: Date.now() });
}

export async function deleteChallenge(id: number) {
  return db.challenges.delete(id);
}
