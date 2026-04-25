import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { useChallenges, createChallenge, updateChallenge, deleteChallenge } from '../db/hooks/useChallenges';
import { usePrompts } from '../db/hooks/usePrompts';
import { I } from '../components/atoms/Icon';
import { StatusDot } from '../components/atoms/StatusDot';
import { StatusPill } from '../components/atoms/StatusPill';
import { TagBadge } from '../components/atoms/TagBadge';
import type { Priority } from '../db/schema';

const PRIORITY_COLOR: Record<string, string> = {
  P0: 'var(--st-blocked)',
  P1: 'oklch(0.72 0.15 55)',
  P2: 'oklch(0.75 0.13 85)',
  P3: 'var(--fg-3)',
};

function PriorityBadge({ p }: { p: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
      padding: '1px 5px', borderRadius: 'var(--r-1)',
      background: PRIORITY_COLOR[p] + '22',
      color: PRIORITY_COLOR[p],
      border: `1px solid ${PRIORITY_COLOR[p]}44`,
      flexShrink: 0,
    }}>{p}</span>
  );
}

export function Challenges() {
  const navigate = useNavigate();
  const { challengeId: urlId } = useParams<{ challengeId: string }>();
  const { activeWorkspaceId } = useUIStore();
  const challenges = useChallenges(activeWorkspaceId);

  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('P1');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [promptSearch, setPromptSearch] = useState('');

  const filtered = search
    ? challenges.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : challenges;

  const selectedId = urlId ? parseInt(urlId) : (filtered[0]?.id ?? null);
  const selected = challenges.find(c => c.id === selectedId) ?? null;

  const prompts = usePrompts(activeWorkspaceId, {
    challengeId: selected?.id,
    search: promptSearch || undefined,
  });

  const uniqueModels = [...new Set(prompts.map(p => p.modelLabel).filter(Boolean))];

  const handleCreate = async () => {
    if (!newTitle.trim() || !activeWorkspaceId) return;
    const id = await createChallenge({ workspaceId: activeWorkspaceId, title: newTitle.trim(), priority: newPriority });
    setNewTitle(''); setShowNew(false);
    navigate(`/challenges/${id}`);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;
    await updateChallenge(editingId, { title: editTitle.trim(), priority: editPriority });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteChallenge(id);
    setConfirmDeleteId(null);
    if (selectedId === id) navigate('/challenges');
  };

  const totalBypassed = challenges.reduce((s, c) => s + c.bypassed, 0);
  const totalPrompts = challenges.reduce((s, c) => s + c.total, 0);

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, height: '100%' }}>

      {/* Left: challenge list */}
      <aside style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)' }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1 }}>Challenges</span>
          <span className="tnum" style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{challenges.length}</span>
          <button onClick={() => setShowNew(v => !v)} style={{ display: 'flex', alignItems: 'center', padding: '3px 8px', background: showNew ? 'var(--bg-3)' : 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-1)', gap: 4, fontSize: 11 }}>
            {I.plus}
          </button>
        </header>

        {/* Global stats */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line-1)', display: 'flex', gap: 16, background: 'var(--bg-1)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{totalBypassed}</div>
            <div style={{ fontSize: 10, color: 'var(--st-bypassed)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>bypassed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{totalPrompts}</div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>prompts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{challenges.length}</div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>challenges</div>
          </div>
        </div>

        {/* New challenge form */}
        {showNew && (
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-1)', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false); }}
              placeholder="Challenge title…"
              style={{ padding: '6px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
                <button key={p} onClick={() => setNewPriority(p)} style={{ padding: '2px 7px', background: newPriority === p ? PRIORITY_COLOR[p] + '22' : 'transparent', border: `1px solid ${newPriority === p ? PRIORITY_COLOR[p] : 'var(--line-1)'}`, borderRadius: 'var(--r-1)', fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: newPriority === p ? PRIORITY_COLOR[p] : 'var(--fg-2)', cursor: 'pointer' }}>{p}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button onClick={handleCreate} disabled={!newTitle.trim()} style={{ padding: '4px 10px', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', fontSize: 11, color: 'var(--bg-0)', cursor: 'pointer', fontWeight: 500 }}>Add</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)' }}>
            <span style={{ color: 'var(--fg-3)', display: 'flex' }}>{I.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter challenges…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--fg-0)', fontFamily: 'var(--font-ui)' }} />
          </div>
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          {filtered.length === 0 && <div style={{ padding: '24px 12px', color: 'var(--fg-3)', fontSize: 12 }}>No challenges found.</div>}
          {filtered.map(c => {
            const isSelected = c.id === selectedId;
            const pct = c.total > 0 ? Math.round((c.bypassed / c.total) * 100) : 0;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/challenges/${c.id}`)}
                style={{ padding: '9px 12px', borderBottom: '1px solid var(--line-1)', borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent', background: isSelected ? 'var(--bg-2)' : 'transparent', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <PriorityBadge p={c.priority} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--fg-0)', fontWeight: isSelected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: 'var(--line-1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--st-bypassed)' : pct > 0 ? 'oklch(0.72 0.15 55)' : 'var(--line-1)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <span className="tnum" style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.bypassed}/{c.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Right: challenge detail */}
      {selected ? (
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Challenge header */}
          <header style={{ flexShrink: 0, borderBottom: '1px solid var(--line-1)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editingId === selected.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                  style={{ padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--accent)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 14, fontWeight: 500, outline: 'none', fontFamily: 'var(--font-mono)' }} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
                    <button key={p} onClick={() => setEditPriority(p)} style={{ padding: '2px 7px', background: editPriority === p ? PRIORITY_COLOR[p] + '22' : 'transparent', border: `1px solid ${editPriority === p ? PRIORITY_COLOR[p] : 'var(--line-1)'}`, borderRadius: 'var(--r-1)', fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: editPriority === p ? PRIORITY_COLOR[p] : 'var(--fg-2)', cursor: 'pointer' }}>{p}</button>
                  ))}
                  <button onClick={handleSaveEdit} style={{ marginLeft: 'auto', padding: '4px 12px', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', fontSize: 11.5, color: 'var(--bg-0)', cursor: 'pointer', fontWeight: 500 }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 11.5, color: 'var(--fg-2)', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <PriorityBadge p={selected.priority} />
                <h1 style={{ margin: 0, flex: 1, fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--fg-0)', lineHeight: 1.35 }}>{selected.title}</h1>
                <button onClick={() => { setEditingId(selected.id!); setEditTitle(selected.title); setEditPriority(selected.priority); }}
                  style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, flexShrink: 0 }}>
                  {I.edit} Edit
                </button>
                {confirmDeleteId === selected.id ? (
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => handleDelete(selected.id!)} style={{ padding: '4px 10px', background: 'var(--st-blocked)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11, color: 'white', fontWeight: 500 }}>Delete</button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11, color: 'var(--fg-2)' }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(selected.id!)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--st-blocked)', display: 'flex', alignItems: 'center', fontSize: 11 }}>
                    {I.trash}
                  </button>
                )}
              </div>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              {[
                { label: 'total', value: selected.total, color: 'var(--fg-0)' },
                { label: 'bypassed', value: selected.bypassed, color: 'var(--st-bypassed)' },
                { label: 'partial', value: selected.partial, color: 'var(--st-partial)' },
                { label: 'blocked', value: selected.blocked, color: 'var(--st-blocked)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="tnum" style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                </div>
              ))}
              {uniqueModels.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="tnum" style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{uniqueModels.length}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>models</span>
                </div>
              )}
              <div style={{ flex: 1 }} />
              {selected.description && (
                <span style={{ fontSize: 11, color: 'var(--fg-3)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selected.description}>
                  {selected.description.slice(0, 100)}{selected.description.length > 100 ? '…' : ''}
                </span>
              )}
            </div>

            {/* Coverage bar */}
            {selected.total > 0 && (
              <div style={{ height: 4, background: 'var(--line-1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ width: `${(selected.bypassed / selected.total) * 100}%`, background: 'var(--st-bypassed)', transition: 'width 0.3s' }} />
                  <div style={{ width: `${(selected.partial / selected.total) * 100}%`, background: 'var(--st-partial)', transition: 'width 0.3s' }} />
                  <div style={{ width: `${(selected.blocked / selected.total) * 100}%`, background: 'var(--st-blocked)', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
          </header>

          {/* Prompts toolbar */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--bg-0)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', flex: 1, maxWidth: 320 }}>
              <span style={{ color: 'var(--fg-3)', display: 'flex' }}>{I.search}</span>
              <input value={promptSearch} onChange={e => setPromptSearch(e.target.value)} placeholder="Search prompts…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--fg-0)', fontFamily: 'var(--font-ui)' }} />
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => navigate(`/library?challenge=${selected.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11.5, color: 'var(--fg-1)' }}>
              {I.hash} View in Library
            </button>
            <button onClick={() => navigate('/library')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11.5, color: 'var(--bg-0)', fontWeight: 500 }}>
              {I.plus} Add prompt
            </button>
          </div>

          {/* Prompt list */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {prompts.length === 0 && (
              <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--fg-3)' }}>
                <span style={{ fontSize: 28 }}>⬡</span>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>No prompts for this challenge yet</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Add a prompt from the Library or import from a chat export.</div>
                <button onClick={() => navigate('/library')} style={{ marginTop: 4, padding: '6px 14px', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>
                  Go to Library
                </button>
              </div>
            )}

            {/* Column headers */}
            {prompts.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 160px 80px 90px', gap: 10, padding: '7px 16px', borderBottom: '1px solid var(--line-1)', fontSize: 10, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--bg-1)' }}>
                <div />
                <div>Prompt / Model</div>
                <div>Tags</div>
                <div>Status</div>
                <div>Date</div>
              </div>
            )}

            {prompts.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/prompts/${p.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '28px 1fr 160px 80px 90px', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--line-1)', cursor: 'pointer', alignItems: 'center', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <StatusDot status={p.status} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-0)', fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  {p.modelLabel && <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{p.modelLabel}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
                  {p.tags.slice(0, 3).map(t => <TagBadge key={t} name={t} />)}
                  {p.tags.length > 3 && <span style={{ fontSize: 10, color: 'var(--fg-3)', alignSelf: 'center' }}>+{p.tags.length - 3}</span>}
                </div>
                <StatusPill status={p.status} />
                <div style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
          {challenges.length === 0 ? 'No challenges yet — create one above.' : 'Select a challenge.'}
        </section>
      )}
    </div>
  );
}
