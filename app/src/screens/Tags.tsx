import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { useTagsWithStats, createTag, updateTag, deleteTag } from '../db/hooks/useTags';
import { usePrompts } from '../db/hooks/usePrompts';
import { computeCoOccurrence } from '../lib/cooccurrence';
import { I } from '../components/atoms/Icon';
import { StatusDot } from '../components/atoms/StatusDot';

const PRESET_COLORS = [
  'oklch(0.74 0.13 235)', 'oklch(0.75 0.13 305)', 'oklch(0.78 0.10 145)',
  'oklch(0.74 0.13 35)',  'oklch(0.72 0.15 0)',   'oklch(0.78 0.13 85)',
  'oklch(0.75 0.12 200)', 'oklch(0.74 0.13 320)', 'oklch(0.7 0.06 270)',
];

export function Tags() {
  const { tagName: paramTag } = useParams<{ tagName?: string }>();
  const navigate = useNavigate();
  const { activeWorkspaceId } = useUIStore();

  const tags = useTagsWithStats(activeWorkspaceId);
  const prompts = usePrompts(activeWorkspaceId);

  const selectedTag = paramTag ? tags.find(t => t.name === decodeURIComponent(paramTag)) : tags[0];
  const taggedPrompts = prompts.filter(p => selectedTag && p.tags.includes(selectedTag.name));
  const coOccur = selectedTag ? computeCoOccurrence(prompts, selectedTag.name) : [];

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createTag({ name: newName.trim(), color: newColor, description: newDesc });
    setNewName(''); setNewDesc(''); setShowNew(false);
  };

  const startEdit = () => {
    if (!selectedTag) return;
    setEditName(selectedTag.name); setEditColor(selectedTag.color); setEditDesc(selectedTag.description);
    setEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedTag?.id) return;
    await updateTag(selectedTag.id, { name: editName, color: editColor, description: editDesc });
    setEditing(false);
    navigate(`/tags/${encodeURIComponent(editName)}`);
  };

  const handleDelete = async () => {
    if (!selectedTag?.id || selectedTag.count > 0) return;
    await deleteTag(selectedTag.id);
    navigate('/tags');
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Center: tag list */}
      <section style={{ width: 380, flexShrink: 0, borderRight: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Tags</span>
          <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{tags.length}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowNew(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', fontSize: 11.5, cursor: 'pointer', color: 'var(--bg-0)' }}>{I.plus} New tag</button>
          </div>
        </header>

        {showNew && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-1)', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tag name…" style={{ padding: '5px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }} />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" style={{ padding: '5px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: c === newColor ? '2px solid var(--fg-0)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleCreate} disabled={!newName.trim()} style={{ flex: 1, padding: '5px 0', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>Create</button>
              <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ overflow: 'auto', flex: 1 }}>
          {tags.length === 0 && <div style={{ padding: '24px 14px', color: 'var(--fg-3)', fontSize: 12.5 }}>No tags yet.</div>}
          {tags.map(tag => {
            const isSelected = tag.name === selectedTag?.name;
            const t = tag.blocked + tag.partial + tag.bypassed;
            return (
              <div key={tag.id} onClick={() => navigate(`/tags/${encodeURIComponent(tag.name)}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--line-1)', background: isSelected ? 'var(--bg-2)' : 'transparent', borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: isSelected ? 'var(--fg-0)' : 'var(--fg-1)', flex: 1 }}>{tag.name}</span>
                {t > 0 && (
                  <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-3)', width: 60 }}>
                    <div style={{ width: `${tag.blocked / t * 100}%`, background: 'var(--st-blocked)' }} />
                    <div style={{ width: `${tag.partial / t * 100}%`, background: 'var(--st-partial)' }} />
                    <div style={{ width: `${tag.bypassed / t * 100}%`, background: 'var(--st-bypassed)' }} />
                  </div>
                )}
                <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', minWidth: 18, textAlign: 'right' }}>{tag.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: selected tag detail */}
      <aside style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedTag ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>Select a tag</div>
        ) : (
          <>
            <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: selectedTag.color }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{selectedTag.name}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <button onClick={startEdit} style={{ background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-2)', padding: 5, display: 'flex' }}>{I.edit}</button>
                {selectedTag.count === 0 && <button onClick={handleDelete} style={{ background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--st-blocked)', padding: 5, display: 'flex' }}>{I.trash}</button>}
              </div>
            </header>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {editing && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '5px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }} />
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ padding: '5px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setEditColor(c)} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: c === editColor ? '2px solid var(--fg-0)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleUpdate} style={{ flex: 1, padding: '5px 0', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>Save</button>
                    <button onClick={() => setEditing(false)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
                {[
                  { label: 'Prompts',  value: selectedTag.count,    sub: 'tagged' },
                  { label: 'Bypassed', value: selectedTag.bypassed, sub: selectedTag.count ? `${Math.round(selectedTag.bypassed / selectedTag.count * 100)}%` : '—', color: 'var(--st-bypassed)' },
                  { label: 'Partial',  value: selectedTag.partial,  sub: selectedTag.count ? `${Math.round(selectedTag.partial / selectedTag.count * 100)}%` : '—', color: 'var(--st-partial)' },
                  { label: 'Blocked',  value: selectedTag.blocked,  sub: selectedTag.count ? `${Math.round(selectedTag.blocked / selectedTag.count * 100)}%` : '—', color: 'var(--st-blocked)' },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '12px 16px', borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--fg-2)', fontWeight: 500 }}>{s.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 4 }}>
                      {s.color && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: s.color }} />}
                      <div className="tnum" style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {coOccur.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Often co-tagged with</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {coOccur.map(c => (
                      <button key={c.name} onClick={() => navigate(`/tags/${encodeURIComponent(c.name)}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 6px 2px 5px', borderRadius: 'var(--r-1)', border: '1px solid var(--line-1)', background: 'var(--bg-1)', color: 'var(--fg-1)', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: tags.find(t => t.name === c.name)?.color ?? 'var(--fg-3)' }} />
                        {c.name} <span style={{ color: 'var(--fg-3)' }}>×{c.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>Prompts</span>
                  <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{taggedPrompts.length}</span>
                </div>
                <div style={{ border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', overflow: 'hidden' }}>
                  {taggedPrompts.length === 0 && <div style={{ padding: '12px 14px', color: 'var(--fg-3)', fontSize: 12 }}>No prompts with this tag.</div>}
                  {taggedPrompts.map((p, i) => (
                    <div key={p.id} onClick={() => navigate(`/prompts/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderTop: i === 0 ? 'none' : '1px solid var(--line-1)', cursor: 'pointer' }}>
                      <StatusDot status={p.status} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', flexShrink: 0 }}>{p.promptId}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--fg-0)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      <span style={{ color: 'var(--fg-3)' }}>{I.chevR}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
