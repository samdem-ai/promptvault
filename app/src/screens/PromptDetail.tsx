import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { usePrompt, usePromptVersions, saveNewVersion, updatePromptMeta, forkPrompt, archivePrompt } from '../db/hooks/usePrompts';
import { useRuns } from '../db/hooks/useRuns';
import { useTags } from '../db/hooks/useTags';
import { I } from '../components/atoms/Icon';
import { StatusDot } from '../components/atoms/StatusDot';
import { StatusPill } from '../components/atoms/StatusPill';
import { TagBadge } from '../components/atoms/TagBadge';
import type { PromptStatus } from '../db/schema';

export function PromptDetail() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { authorName } = useUIStore();
  const id = parseInt(promptId ?? '0');

  const prompt = usePrompt(id);
  const versions = usePromptVersions(id);
  const runs = useRuns(prompt?.workspaceId ?? null, id);
  const allTags = useTags();

  const [activeTab, setActiveTab] = useState<'Prompt' | 'Versions' | 'Runs' | 'Notes'>('Prompt');
  const [editBody, setEditBody] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [notes, setNotes] = useState('');
  const [showTagEdit, setShowTagEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentVersion = versions.find(v => v.id === prompt?.currentVersionId);
  const versionNum = (versions[versions.length - 1]?.versionNumber ?? 0) + 1;

  useEffect(() => {
    if (currentVersion?.body != null) setEditBody(currentVersion.body);
  }, [currentVersion?.id]);

  if (!prompt) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
      Prompt not found.
    </div>
  );

  const isDirty = editBody !== (currentVersion?.body ?? '');

  const handleSave = async () => {
    setSaving(true);
    await saveNewVersion(id, editBody, changeNote || `v${versionNum}`, authorName);
    setChangeNote('');
    setSaving(false);
  };

  const handleFork = async () => {
    const newId = await forkPrompt(id, authorName);
    navigate(`/prompts/${newId}`);
  };

  const handleArchive = async () => {
    await archivePrompt(id, 'manually archived');
    navigate('/library');
  };

  const handleTagToggle = async (tagName: string) => {
    const tags = prompt.tags.includes(tagName)
      ? prompt.tags.filter(t => t !== tagName)
      : [...prompt.tags, tagName];
    await updatePromptMeta(id, { tags });
  };

  const handleStatusChange = async (s: PromptStatus) => {
    await updatePromptMeta(id, { status: s });
  };

  const statusColors: Record<PromptStatus, string> = {
    bypassed: 'var(--st-bypassed)', partial: 'var(--st-partial)',
    blocked: 'var(--st-blocked)', untested: 'var(--st-untested)',
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Left: editor */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line-1)', minWidth: 0 }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--fg-2)' }}>
            <button onClick={() => navigate('/library')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12.5, padding: 0 }}>Prompts</button>
            <span style={{ color: 'var(--fg-3)' }}>/</span>
            <span style={{ color: 'var(--fg-0)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{prompt.promptId}</span>
          </div>
          <StatusPill status={prompt.status} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={handleFork} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11.5, color: 'var(--fg-1)' }}>{I.branch} Fork</button>
            <button onClick={() => navigator.clipboard.writeText(editBody)} style={{ background: 'none', border: '1px solid transparent', borderRadius: 'var(--r-2)', cursor: 'pointer', color: 'var(--fg-2)', padding: 5, display: 'flex' }}>{I.copy}</button>
            {isDirty && (
              <>
                <input value={changeNote} onChange={e => setChangeNote(e.target.value)} placeholder={`v${versionNum} note…`}
                  style={{ padding: '4px 8px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 11.5, color: 'var(--fg-1)', outline: 'none', width: 180, fontFamily: 'var(--font-ui)' }} />
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 11.5, color: 'var(--bg-0)', fontWeight: 500 }}>
                  {I.check} Save v{versionNum}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Title + tabs */}
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--line-1)' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 500, letterSpacing: '-0.018em', fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>
            {prompt.title}
          </h1>
          <div style={{ display: 'flex', gap: 0 }}>
            {(['Prompt', 'Versions', 'Runs', 'Notes'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 14px', fontSize: 12, color: activeTab === tab ? 'var(--fg-0)' : 'var(--fg-2)', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === tab ? 500 : 400, marginBottom: -1, background: 'none', border: 'none' }}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeTab === 'Prompt' && (
            <>
              {/* Version selector */}
              {versions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', overflow: 'hidden', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {versions.slice().reverse().map((v, i) => (
                      <button key={v.id} onClick={() => setEditBody(v.body)} style={{ padding: '3px 10px', background: v.id === currentVersion?.id ? 'var(--bg-3)' : 'transparent', border: 'none', borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)', color: v.id === currentVersion?.id ? 'var(--fg-0)' : 'var(--fg-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%' }} />
                        v{v.versionNumber}
                      </button>
                    ))}
                  </div>
                  {isDirty && <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>• unsaved changes</span>}
                </div>
              )}
              <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
                style={{ flex: 1, minHeight: 300, padding: 14, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.65, resize: 'none', outline: 'none' }} />
              <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                {editBody.length} chars · {editBody.split('\n').length} lines
              </div>
            </>
          )}

          {activeTab === 'Versions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 7, top: 10, bottom: 10, width: 1, background: 'var(--line-1)' }} />
              {versions.slice().reverse().map((v, i) => (
                <div key={v.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--bg-1)', border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--line-2)'}`, flexShrink: 0, zIndex: 1, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: i === 0 ? 500 : 400, fontFamily: 'var(--font-mono)', color: i === 0 ? 'var(--fg-0)' : 'var(--fg-1)' }}>v{v.versionNumber}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{v.author}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--fg-3)', marginLeft: 'auto' }}>{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                    {v.changeNote && <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.4, marginBottom: 6 }}>{v.changeNote}</div>}
                    <pre style={{ margin: 0, padding: '8px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'hidden' }}>{v.body}</pre>
                    <button onClick={() => { setEditBody(v.body); setActiveTab('Prompt'); }} style={{ marginTop: 6, padding: '3px 8px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-1)', cursor: 'pointer', fontSize: 10.5, color: 'var(--fg-2)' }}>Restore this version</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Runs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {runs.length === 0 && <div style={{ color: 'var(--fg-3)', fontSize: 12.5, padding: '20px 0' }}>No runs recorded yet. Log a result in the Runs screen.</div>}
              {runs.map((r) => (
                <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot status={r.status} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-2)' }}>{r.runId}</span>
                    {r.duration && <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{r.duration}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--fg-3)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.notes && <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.4, paddingLeft: 16 }}>{r.notes}</div>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Notes' && (
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Free-form notes about this prompt…"
              style={{ flex: 1, minHeight: 300, padding: 14, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.65, resize: 'none', outline: 'none' }} />
          )}
        </div>
      </section>

      {/* Right: properties */}
      <aside style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 11, color: 'var(--fg-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Properties
        </header>

        <div style={{ overflow: 'auto', flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Status</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['bypassed', 'partial', 'blocked', 'untested'] as PromptStatus[]).map(s => (
                <button key={s} onClick={() => handleStatusChange(s)} style={{ flex: 1, minWidth: 70, padding: '4px 6px', background: s === prompt.status ? 'var(--bg-3)' : 'transparent', border: `1px solid ${s === prompt.status ? statusColors[s] : 'var(--line-1)'}`, borderRadius: 'var(--r-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10.5, color: s === prompt.status ? 'var(--fg-0)' : 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: statusColors[s] }} />{s}
                </button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 11.5 }}>
            <span style={{ color: 'var(--fg-3)' }}>Model</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-0)' }}>{prompt.modelLabel || '—'}</span>
            <span style={{ color: 'var(--fg-3)' }}>Author</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{prompt.author}</span>
            <span style={{ color: 'var(--fg-3)' }}>Updated</span>
            <span style={{ color: 'var(--fg-1)' }}>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
            <span style={{ color: 'var(--fg-3)' }}>Versions</span>
            <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{versions.length}</span>
            <span style={{ color: 'var(--fg-3)' }}>Runs</span>
            <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{runs.length}</span>
          </div>

          {/* Tags */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>Tags</div>
              <button onClick={() => setShowTagEdit(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent)' }}>{showTagEdit ? 'done' : 'edit'}</button>
            </div>
            {showTagEdit ? (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {allTags.map(t => {
                  const has = prompt.tags.includes(t.name);
                  return (
                    <button key={t.name} onClick={() => handleTagToggle(t.name)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px 2px 5px', border: `1px solid ${has ? t.color : 'var(--line-1)'}`, borderRadius: 'var(--r-1)', background: has ? `${t.color}22` : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: has ? 'var(--fg-0)' : 'var(--fg-2)' }}>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: t.color }} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {prompt.tags.map(t => <TagBadge key={t} name={t} />)}
                {prompt.tags.length === 0 && <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>No tags</span>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={handleFork} style={{ padding: '6px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{I.branch} Fork prompt</button>
            <button onClick={handleArchive} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{I.archive} Archive</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
