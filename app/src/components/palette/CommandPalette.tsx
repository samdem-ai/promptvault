import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/ui';
import { db } from '../../db/db';
import { I } from '../atoms/Icon';
import { StatusDot } from '../atoms/StatusDot';
import type { PromptStatus } from '../../db/schema';

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  status?: PromptStatus;
  action: () => void;
}

interface PaletteGroup {
  section: string;
  items: PaletteItem[];
}

export function CommandPalette() {
  const { closePalette, paletteQuery, setPaletteQuery, activeWorkspaceId } = useUIStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [groups, setGroups] = useState<PaletteGroup[]>([]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const buildGroups = useCallback(async (q: string): Promise<PaletteGroup[]> => {
    const lower = q.toLowerCase().trim();

    if (!lower) {
      // recent prompts + quick actions
      const recent = activeWorkspaceId != null
        ? await db.prompts.where('workspaceId').equals(activeWorkspaceId).filter(p => !p.archived).sortBy('updatedAt').then(r => r.reverse().slice(0, 4))
        : [];

      return [
        {
          section: 'Recent prompts',
          items: recent.map(p => ({
            id: `p-${p.id}`, label: p.title, hint: p.promptId, status: p.status,
            icon: <StatusDot status={p.status} />,
            action: () => { navigate(`/prompts/${p.id}`); closePalette(); },
          })),
        },
        {
          section: 'Actions',
          items: [
            { id: 'new', label: 'New prompt', hint: 'N', icon: I.plus, action: () => { navigate('/library?new=1'); closePalette(); } },
            { id: 'import', label: 'Import chat export', hint: 'I', icon: I.upload, action: () => { navigate('/import'); closePalette(); } },
            { id: 'tags', label: 'Manage tags', hint: 'T', icon: I.tag, action: () => { navigate('/tags'); closePalette(); } },
            { id: 'runs', label: 'View run history', hint: 'R', icon: I.history, action: () => { navigate('/runs'); closePalette(); } },
          ],
        },
      ];
    }

    // prefix search
    const isTag = lower.startsWith('t:');
    const isChallenge = lower.startsWith('c:');
    const term = lower.replace(/^[tpc]:/, '');

    if (isTag) {
      const tags = await db.tags.filter(t => t.name.includes(term)).limit(8).toArray();
      return [{
        section: 'Tags',
        items: tags.map(t => ({
          id: `t-${t.id}`, label: t.name, hint: 'tag', icon: I.tag,
          action: () => { navigate(`/tags/${encodeURIComponent(t.name)}`); closePalette(); },
        })),
      }];
    }

    if (isChallenge) {
      const challenges = activeWorkspaceId != null
        ? await db.challenges.where('workspaceId').equals(activeWorkspaceId).filter(c => c.title.toLowerCase().includes(term)).limit(8).toArray()
        : [];
      return [{
        section: 'Challenges',
        items: challenges.map(c => ({
          id: `c-${c.id}`, label: c.title, hint: c.challengeId, icon: I.layers,
          action: () => { navigate('/overview'); closePalette(); },
        })),
      }];
    }

    // free text: prompts + tags
    const [prompts, tags] = await Promise.all([
      activeWorkspaceId != null
        ? db.prompts.where('workspaceId').equals(activeWorkspaceId)
            .filter(p => !p.archived && (p.title.toLowerCase().includes(term) || p.promptId.toLowerCase().includes(term)))
            .limit(6).toArray()
        : [],
      db.tags.filter(t => t.name.includes(term)).limit(4).toArray(),
    ]);

    const result: PaletteGroup[] = [];
    if (prompts.length) result.push({
      section: 'Prompts',
      items: prompts.map(p => ({
        id: `p-${p.id}`, label: p.title, hint: p.promptId, status: p.status,
        icon: <StatusDot status={p.status} />,
        action: () => { navigate(`/prompts/${p.id}`); closePalette(); },
      })),
    });
    if (tags.length) result.push({
      section: 'Tags',
      items: tags.map(t => ({
        id: `t-${t.id}`, label: t.name, hint: 'tag', icon: I.tag,
        action: () => { navigate(`/tags/${encodeURIComponent(t.name)}`); closePalette(); },
      })),
    });
    return result;
  }, [activeWorkspaceId, navigate, closePalette]);

  useEffect(() => {
    let cancelled = false;
    buildGroups(paletteQuery).then(g => { if (!cancelled) { setGroups(g); setActiveIdx(0); } });
    return () => { cancelled = true; };
  }, [paletteQuery, buildGroups]);

  const allItems = groups.flatMap(g => g.items);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); allItems[activeIdx]?.action(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [allItems, activeIdx, closePalette]);

  let itemOffset = 0;

  return (
    <div onClick={closePalette} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'oklch(0 0 0 / 0.55)', backdropFilter: 'blur(2px)',
      display: 'flex', justifyContent: 'center', paddingTop: 120,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxHeight: 480,
        background: 'var(--bg-1)',
        border: '1px solid var(--line-2)', borderRadius: 10,
        boxShadow: '0 24px 60px oklch(0 0 0 / 0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px', borderBottom: '1px solid var(--line-1)',
        }}>
          <span style={{ color: 'var(--fg-2)' }}>{I.search}</span>
          <input
            ref={inputRef}
            value={paletteQuery}
            onChange={e => setPaletteQuery(e.target.value)}
            placeholder="Search prompts, tags, challenges…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--fg-0)', fontSize: 14,
              fontFamily: 'var(--font-ui)', caretColor: 'var(--accent)',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5,
            padding: '2px 5px', border: '1px solid var(--line-1)',
            borderBottomWidth: 2, borderRadius: 'var(--r-1)',
            color: 'var(--fg-1)', background: 'var(--bg-0)',
          }}>esc</span>
        </div>

        {/* Results */}
        <div style={{ overflow: 'auto', padding: '6px 0', flex: 1 }}>
          {groups.map(group => {
            const groupStart = itemOffset;
            itemOffset += group.items.length;
            return (
              <div key={group.section}>
                <div style={{
                  padding: '8px 16px 4px', fontSize: 10.5, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)',
                }}>{group.section}</div>
                {group.items.map((item, ii) => {
                  const globalIdx = groupStart + ii;
                  const isActive = globalIdx === activeIdx;
                  return (
                    <div key={item.id} onClick={item.action} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 16px',
                      background: isActive ? 'var(--bg-2)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                      cursor: 'pointer', fontSize: 12.5,
                    }}>
                      <span style={{ color: isActive ? 'var(--fg-0)' : 'var(--fg-2)', display: 'flex' }}>{item.icon}</span>
                      <span style={{ flex: 1, color: isActive ? 'var(--fg-0)' : 'var(--fg-1)', fontFamily: item.status ? 'var(--font-mono)' : 'var(--font-ui)', fontSize: item.status ? 12 : 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{item.hint}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {allItems.length === 0 && paletteQuery && (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12.5 }}>
              No results for "{paletteQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--line-1)',
          display: 'flex', alignItems: 'center', gap: 14,
          fontSize: 11, color: 'var(--fg-3)',
        }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, l]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 5px', border: '1px solid var(--line-1)', borderBottomWidth: 2, borderRadius: 'var(--r-1)', color: 'var(--fg-1)', background: 'var(--bg-1)' }}>{k}</span>
              {l}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{allItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
