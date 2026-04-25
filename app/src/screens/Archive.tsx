import { useState } from 'react';
import { useUIStore } from '../store/ui';
import { usePrompts, restorePrompt, deletePromptPermanently } from '../db/hooks/usePrompts';
import { I } from '../components/atoms/Icon';
import { StatusPill } from '../components/atoms/StatusPill';
import { TagBadge } from '../components/atoms/TagBadge';

export function Archive() {
  const { activeWorkspaceId } = useUIStore();
  const archived = usePrompts(activeWorkspaceId, { archived: true });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = archived.find(p => p.id === selectedId) ?? archived[0] ?? null;

  const handleRestore = async () => {
    if (!selected?.id) return;
    await restorePrompt(selected.id);
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    await deletePromptPermanently(selected.id);
    setSelectedId(null); setConfirmDelete(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Center: archived list */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line-1)', minWidth: 0 }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <span style={{ color: 'var(--fg-2)', display: 'flex' }}>{I.archive}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Archive</span>
          <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{archived.length}</span>
        </header>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 100px 90px', gap: 12, padding: '8px 14px', borderBottom: '1px solid var(--line-1)', fontSize: 10.5, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <div>ID</div><div>Title</div><div>Reason</div><div>Status</div><div>Archived</div>
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          {archived.length === 0 && <div style={{ padding: '32px 14px', color: 'var(--fg-3)', fontSize: 12.5 }}>No archived prompts.</div>}
          {archived.map(p => {
            const isSelected = p.id === selected?.id;
            return (
              <div key={p.id} onClick={() => setSelectedId(p.id ?? null)} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 100px 90px', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--line-1)', borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent', background: isSelected ? 'var(--bg-2)' : 'transparent', alignItems: 'center', cursor: 'pointer', opacity: 0.85 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-2)' }}>{p.promptId}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-0)', fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{p.archiveReason || '—'}</div>
                <div><StatusPill status={p.status} /></div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{p.archivedAt ? new Date(p.archivedAt).toLocaleDateString() : '—'}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: detail */}
      {selected && (
        <aside style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>{selected.promptId}</span>
            <StatusPill status={selected.status} />
          </header>

          <div style={{ overflow: 'auto', flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 'var(--r-1)', background: 'var(--bg-3)', fontSize: 10.5, color: 'var(--fg-2)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                {I.archive} <span>archived {selected.archivedAt ? new Date(selected.archivedAt).toLocaleDateString() : ''}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em', fontFamily: 'var(--font-mono)', lineHeight: 1.4, color: 'var(--fg-1)' }}>{selected.title}</h2>
            </div>

            {selected.archiveReason && (
              <div style={{ padding: '8px 12px', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', background: 'var(--bg-1)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>Reason</span>
                {selected.archiveReason}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 11.5 }}>
              <span style={{ color: 'var(--fg-3)' }}>Model</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{selected.modelLabel || '—'}</span>
              <span style={{ color: 'var(--fg-3)' }}>Author</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{selected.author}</span>
            </div>

            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {selected.tags.map(t => <TagBadge key={t} name={t} />)}
                {selected.tags.length === 0 && <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>No tags</span>}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleRestore} style={{ padding: '6px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{I.restore} Restore to library</button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--st-blocked)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{I.trash} Delete permanently</button>
              ) : (
                <div style={{ padding: '10px 12px', background: 'oklch(0.66 0.18 25 / 0.1)', border: '1px solid var(--st-blocked)', borderRadius: 'var(--r-2)', fontSize: 12 }}>
                  <div style={{ color: 'var(--fg-0)', marginBottom: 8 }}>Delete "{selected.title}" and all its versions and runs? This cannot be undone.</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleDelete} style={{ flex: 1, padding: '5px 0', background: 'var(--st-blocked)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'white', fontWeight: 500 }}>Delete</button>
                    <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '5px 0', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
