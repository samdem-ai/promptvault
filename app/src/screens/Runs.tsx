import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { useRuns, createRun, updateRunStatus, deleteRun } from '../db/hooks/useRuns';
import { usePrompts } from '../db/hooks/usePrompts';
import { I } from '../components/atoms/Icon';
import { StatusPill } from '../components/atoms/StatusPill';
import type { PromptStatus } from '../db/schema';

export function Runs() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useUIStore();
  const runs = useRuns(activeWorkspaceId);
  const prompts = usePrompts(activeWorkspaceId);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newPromptId, setNewPromptId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<PromptStatus>('blocked');
  const [newNotes, setNewNotes] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedRun = runs.find(r => r.id === selectedId) ?? runs[0] ?? null;
  const statusCounts = { bypassed: 0, partial: 0, blocked: 0 };
  runs.forEach(r => { if (r.status in statusCounts) (statusCounts as any)[r.status]++; });

  const handleCreateRun = async () => {
    if (!newPromptId || !activeWorkspaceId) return;
    setSaving(true);
    await createRun({ promptId: newPromptId, versionId: null, workspaceId: activeWorkspaceId, challengeId: null, status: newStatus, notes: newNotes, duration: newDuration });
    setShowNew(false); setNewPromptId(null); setNewNotes(''); setNewDuration(''); setNewStatus('blocked');
    setSaving(false);
  };

  const statusColors: Record<PromptStatus, string> = {
    bypassed: 'var(--st-bypassed)', partial: 'var(--st-partial)',
    blocked: 'var(--st-blocked)', untested: 'var(--st-untested)',
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Center: run list */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line-1)', minWidth: 0 }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Runs</span>
          <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{runs.length}</span>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => setShowNew(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', fontSize: 11.5, cursor: 'pointer', color: 'var(--bg-0)' }}>{I.plus} Log run</button>
          </div>
        </header>

        {/* Summary */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-1)' }}>
          {(['bypassed', 'partial', 'blocked'] as const).map(s => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: statusColors[s] }} />
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{statusCounts[s]}</span>
              <span style={{ color: 'var(--fg-3)' }}>{s}</span>
            </span>
          ))}
        </div>

        {/* New run form */}
        {showNew && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-1)', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>Log new run</div>
            <select value={newPromptId ?? ''} onChange={e => setNewPromptId(e.target.value ? parseInt(e.target.value) : null)} style={{ padding: '6px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none' }}>
              <option value="">Select prompt…</option>
              {prompts.map(p => <option key={p.id} value={p.id}>{p.promptId} — {p.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 5 }}>
              {(['bypassed', 'partial', 'blocked'] as PromptStatus[]).map(s => (
                <button key={s} onClick={() => setNewStatus(s)} style={{ flex: 1, padding: '5px 0', background: s === newStatus ? 'var(--bg-3)' : 'transparent', border: `1px solid ${s === newStatus ? statusColors[s] : 'var(--line-1)'}`, borderRadius: 'var(--r-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10.5, fontFamily: 'var(--font-mono)', color: s === newStatus ? 'var(--fg-0)' : 'var(--fg-2)' }}>
                  <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: statusColors[s] }} />{s}
                </button>
              ))}
            </div>
            <input value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="Duration (e.g. 1.4s)" style={{ padding: '5px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)' }} />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes…" rows={2} style={{ padding: '6px 8px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 12, outline: 'none', resize: 'none', lineHeight: 1.5 }} />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNew(false)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)' }}>Cancel</button>
              <button onClick={handleCreateRun} disabled={!newPromptId || saving} style={{ padding: '5px 12px', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>Log run</button>
            </div>
          </div>
        )}

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 70px 80px 100px', gap: 12, padding: '8px 14px', borderBottom: '1px solid var(--line-1)', fontSize: 10.5, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <div>Run</div><div>Prompt</div><div>Duration</div><div>Result</div><div>Date</div>
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          {runs.length === 0 && <div style={{ padding: '32px 14px', color: 'var(--fg-3)', fontSize: 12.5 }}>No runs yet. Log your first result.</div>}
          {runs.map(r => {
            const isSelected = r.id === selectedRun?.id;
            const prompt = prompts.find(p => p.id === r.promptId);
            return (
              <div key={r.id} onClick={() => setSelectedId(r.id ?? null)} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 70px 80px 100px', gap: 12, padding: '9px 14px', borderBottom: '1px solid var(--line-1)', borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent', background: isSelected ? 'var(--bg-2)' : 'transparent', alignItems: 'center', cursor: 'pointer', fontSize: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-2)' }}>{r.runId}</div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg-0)' }}>{prompt?.title ?? r.promptId}</div>
                <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>{r.duration || '—'}</div>
                <div><StatusPill status={r.status} /></div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: run detail */}
      {selectedRun && (() => {
        const prompt = prompts.find(p => p.id === selectedRun.promptId);
        return (
          <aside style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>{selectedRun.runId}</span>
              <StatusPill status={selectedRun.status} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <button onClick={() => selectedRun.id && deleteRun(selectedRun.id).then(() => setSelectedId(null))} title="Delete run" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 5, display: 'flex' }}>{I.trash}</button>
              </div>
            </header>

            <div style={{ overflow: 'auto', flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {prompt && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>Prompt</div>
                  <button onClick={() => navigate(`/prompts/${prompt.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{prompt.promptId}</button>
                  <div style={{ fontSize: 13, color: 'var(--fg-0)', marginTop: 3 }}>{prompt.title}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 11.5 }}>
                <span style={{ color: 'var(--fg-3)' }}>Duration</span>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>{selectedRun.duration || '—'}</span>
                <span style={{ color: 'var(--fg-3)' }}>Date</span>
                <span style={{ color: 'var(--fg-1)' }}>{new Date(selectedRun.createdAt).toLocaleString()}</span>
              </div>

              {selectedRun.notes && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>Notes</div>
                  <div style={{ padding: '8px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.5 }}>{selectedRun.notes}</div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>Change result</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {(['bypassed', 'partial', 'blocked'] as PromptStatus[]).map(s => (
                    <button key={s} onClick={() => selectedRun.id && updateRunStatus(selectedRun.id, s, selectedRun.promptId)} style={{ flex: 1, padding: '5px 0', background: s === selectedRun.status ? 'var(--bg-3)' : 'transparent', border: `1px solid ${s === selectedRun.status ? statusColors[s] : 'var(--line-1)'}`, borderRadius: 'var(--r-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10.5, fontFamily: 'var(--font-mono)', color: s === selectedRun.status ? 'var(--fg-0)' : 'var(--fg-2)' }}>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: statusColors[s] }} />{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        );
      })()}
    </div>
  );
}
