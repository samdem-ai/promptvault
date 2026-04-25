import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { usePrompts, createPrompt, updatePromptMeta, archivePrompt } from '../db/hooks/usePrompts';
import { usePromptVersion } from '../db/hooks/usePrompts';
import { useTags } from '../db/hooks/useTags';
import { useChallenges } from '../db/hooks/useChallenges';
import { I } from '../components/atoms/Icon';
import { StatusDot } from '../components/atoms/StatusDot';
import { StatusPill } from '../components/atoms/StatusPill';
import { TagBadge } from '../components/atoms/TagBadge';
import type { PromptStatus } from '../db/schema';

const STATUS_OPTIONS: PromptStatus[] = ['bypassed', 'partial', 'blocked', 'untested'];

function parseFilterQuery(q: string) {
  const tags: string[] = [];
  const statuses: PromptStatus[] = [];
  let search = q;
  const tagMatches = q.matchAll(/tag:(\S+)/g);
  const statusMatches = q.matchAll(/status:(!?)(\S+)/g);
  for (const m of tagMatches) { tags.push(m[1]); search = search.replace(m[0], ''); }
  for (const m of statusMatches) { if (!m[1]) statuses.push(m[2] as PromptStatus); search = search.replace(m[0], ''); }
  return { tags, statuses, search: search.trim() };
}

export function Library() {
  const { promptId: paramId } = useParams<{ promptId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeWorkspaceId, authorName } = useUIStore();
  const allTags = useTags();
  const challenges = useChallenges(activeWorkspaceId);

  const [filterQuery, setFilterQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(searchParams.get('new') === '1');
  const [newTitle, setNewTitle] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newChallengeId, setNewChallengeId] = useState<number | null>(null);
  const [newBody, setNewBody] = useState('');

  const { tags, statuses, search } = parseFilterQuery(filterQuery);
  const prompts = usePrompts(activeWorkspaceId, { tags, statuses, search });
  const selectedId = paramId ? parseInt(paramId) : null;
  const selectedPrompt = prompts.find(p => p.id === selectedId) ?? null;
  const currentVersion = usePromptVersion(selectedPrompt?.currentVersionId ?? null);

  const handleCreate = async () => {
    if (!newTitle.trim() || !activeWorkspaceId) return;
    const id = await createPrompt({
      workspaceId: activeWorkspaceId, challengeId: newChallengeId,
      title: newTitle.trim(), tags: newTags, status: 'untested',
      modelLabel: newModel, author: authorName,
      archived: false, archivedAt: null, archiveReason: '',
    }, newBody, 'Initial version', authorName);
    setShowNewForm(false); setNewTitle(''); setNewBody(''); setNewTags([]); setNewModel(''); setNewChallengeId(null);
    navigate(`/library/${id}`);
  };

  const handleStatusChange = async (newStatus: PromptStatus) => {
    if (!selectedId) return;
    await updatePromptMeta(selectedId, { status: newStatus });
  };

  const handleArchive = async () => {
    if (!selectedId) return;
    await archivePrompt(selectedId, 'manually archived');
    navigate('/library');
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Center panel */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line-1)', minWidth: 0 }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Prompts</span>
          <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{prompts.length}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowNewForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', fontSize: 12, cursor: 'pointer', color: 'var(--bg-0)' }}>{I.plus} New</button>
          </div>
        </header>

        {/* Filter bar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', flex: '0 0 300px', fontSize: 12, color: 'var(--fg-1)' }}>
            <span style={{ color: 'var(--fg-3)' }}>{I.search}</span>
            <input value={filterQuery} onChange={e => setFilterQuery(e.target.value)}
              placeholder="tag:encoding status:bypassed…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-0)' }} />
          </div>
          {tags.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 6px 2px 5px', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-1)', background: 'var(--accent-dim)', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>
              <span style={{ color: 'var(--fg-2)' }}>tag:</span>{t}
              <button onClick={() => setFilterQuery(filterQuery.replace(`tag:${t}`, '').trim())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-2)', fontSize: 12, padding: 0 }}>×</button>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
            {prompts.length} prompts
          </span>
        </div>

        {/* New prompt form */}
        {showNewForm && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-1)', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>New prompt</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title…"
              style={{ padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font-ui)' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="Model label (e.g. gpt-4o)"
                style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }} />
              <select value={newChallengeId ?? ''} onChange={e => setNewChallengeId(e.target.value ? parseInt(e.target.value) : null)}
                style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-ui)' }}>
                <option value="">No challenge</option>
                {challenges.map(c => <option key={c.id} value={c.id}>{c.challengeId} — {c.title}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--fg-3)', marginBottom: 5 }}>Tags</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {allTags.map(t => {
                  const selected = newTags.includes(t.name);
                  return (
                    <button key={t.name} onClick={() => setNewTags(prev => selected ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px 2px 5px', border: `1px solid ${selected ? t.color : 'var(--line-1)'}`, borderRadius: 'var(--r-1)', background: selected ? `${t.color}22` : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: selected ? 'var(--fg-0)' : 'var(--fg-2)' }}>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: t.color }} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Prompt body…" rows={4}
              style={{ padding: '8px 10px', background: 'var(--bg-0)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-1)', fontSize: 12, fontFamily: 'var(--font-mono)', resize: 'vertical', outline: 'none', lineHeight: 1.55 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewForm(false)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-1)' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} style={{ padding: '5px 12px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>Create prompt</button>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {prompts.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12.5 }}>
              No prompts yet. Create one or import a chat export.
            </div>
          )}
          {prompts.map(p => {
            const isSelected = p.id === selectedId;
            return (
              <article key={p.id} onClick={() => navigate(`/library/${p.id}`)} style={{
                padding: '12px 16px', borderBottom: '1px solid var(--line-1)',
                background: isSelected ? 'var(--bg-2)' : 'transparent',
                borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                gap: 14, cursor: 'pointer',
              }}>
                <div style={{ paddingTop: 5 }}><StatusDot status={p.status} size={8} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{p.promptId}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
                    {p.tags.map(t => <TagBadge key={t} name={t} />)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', minWidth: 90 }}>
                  <StatusPill status={p.status} />
                  <span className="tnum">{new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Right panel */}
      {selectedPrompt && (
        <aside style={{ width: 380, flexShrink: 0, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
          <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>{selectedPrompt.promptId}</span>
            <StatusPill status={selectedPrompt.status} />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => navigator.clipboard.writeText(currentVersion?.body ?? '')} title="Copy body" style={{ background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-2)', padding: 5, display: 'flex' }}>{I.copy}</button>
              <button onClick={() => navigate(`/prompts/${selectedPrompt.id}`)} title="Open full detail" style={{ background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-2)', padding: 5, display: 'flex' }}>{I.ext}</button>
            </div>
          </header>

          <div style={{ overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: '-0.015em', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{selectedPrompt.title}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 11.5 }}>
              <span style={{ color: 'var(--fg-3)' }}>Model</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{selectedPrompt.modelLabel || '—'}</span>
              <span style={{ color: 'var(--fg-3)' }}>Author</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{selectedPrompt.author}</span>
              <span style={{ color: 'var(--fg-3)' }}>Updated</span>
              <span style={{ color: 'var(--fg-1)' }}>{new Date(selectedPrompt.updatedAt).toLocaleString()}</span>
            </div>

            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {selectedPrompt.tags.map(t => <TagBadge key={t} name={t} />)}
                {selectedPrompt.tags.length === 0 && <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>No tags</span>}
              </div>
            </div>

            {currentVersion && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>Prompt</div>
                </div>
                <pre style={{ margin: 0, padding: 12, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-1)', lineHeight: 1.55, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'hidden' }}>
                  {currentVersion.body}
                </pre>
              </div>
            )}

            {/* Status quick-change */}
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Status</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {STATUS_OPTIONS.map(s => {
                  const c = { bypassed: 'var(--st-bypassed)', partial: 'var(--st-partial)', blocked: 'var(--st-blocked)', untested: 'var(--st-untested)' }[s];
                  return (
                    <button key={s} onClick={() => handleStatusChange(s)} style={{ flex: 1, padding: '4px 0', background: s === selectedPrompt.status ? 'var(--bg-3)' : 'transparent', border: `1px solid ${s === selectedPrompt.status ? c : 'var(--line-1)'}`, borderRadius: 'var(--r-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10.5, color: s === selectedPrompt.status ? 'var(--fg-0)' : 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: c }} />{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--line-1)', paddingTop: 14 }}>
              <button onClick={() => navigate(`/prompts/${selectedPrompt.id}`)} style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{I.edit} Edit</button>
              <button onClick={handleArchive} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>{I.archive}</button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
