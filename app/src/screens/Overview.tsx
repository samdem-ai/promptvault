import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/ui';
import { useChallenges } from '../db/hooks/useChallenges';
import { usePrompts } from '../db/hooks/usePrompts';
import { useWorkspace } from '../db/hooks/useWorkspaces';
import { I } from '../components/atoms/Icon';
import { exportWorkspaceJson, downloadJson } from '../lib/exporters/json';
import { exportWorkspaceMarkdown, downloadText } from '../lib/exporters/markdown';

function Bar({ blocked, partial, bypassed, total }: { blocked: number; partial: number; bypassed: number; total: number }) {
  if (!total) return <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-3)', width: 96 }} />;
  return (
    <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-3)', width: 96 }}>
      <div style={{ width: `${blocked / total * 100}%`, background: 'var(--st-blocked)' }} />
      <div style={{ width: `${partial / total * 100}%`, background: 'var(--st-partial)' }} />
      <div style={{ width: `${bypassed / total * 100}%`, background: 'var(--st-bypassed)' }} />
    </div>
  );
}

export function Overview() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useUIStore();
  const workspace = useWorkspace(activeWorkspaceId);
  const challenges = useChallenges(activeWorkspaceId);
  const allPrompts = usePrompts(activeWorkspaceId);

  const total    = allPrompts.length;
  const bypassed = allPrompts.filter(p => p.status === 'bypassed').length;
  const partial  = allPrompts.filter(p => p.status === 'partial').length;
  const blocked  = allPrompts.filter(p => p.status === 'blocked').length;

  const handleExportJson = async () => {
    if (!workspace) return;
    const content = await exportWorkspaceJson(workspace);
    downloadJson(`${workspace.name.replace(/\s+/g, '-')}.json`, content);
  };

  const handleExportMd = async () => {
    if (!workspace) return;
    const content = await exportWorkspaceMarkdown(workspace);
    downloadText(`${workspace.name.replace(/\s+/g, '-')}.md`, content);
  };

  if (!workspace) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
      Select or create a workspace to get started.
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header style={{
        height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14,
      }}>
        <div style={{ fontSize: 12.5, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Workspace</span>
          <span style={{ color: 'var(--fg-3)' }}>/</span>
          <span style={{ color: 'var(--fg-0)', fontWeight: 500 }}>{workspace.name}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={handleExportMd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 12, cursor: 'pointer', color: 'var(--fg-0)' }}>{I.download} Export .md</button>
          <button onClick={handleExportJson} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 12, cursor: 'pointer', color: 'var(--fg-0)' }}>{I.download} Export .json</button>
          <button onClick={() => navigate('/import')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 12, cursor: 'pointer', color: 'var(--fg-0)' }}>{I.upload} Import</button>
          <button onClick={() => navigate('/library?new=1')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', fontSize: 12, cursor: 'pointer', color: 'var(--bg-0)' }}>{I.plus} New prompt</button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden', padding: '28px 40px 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Workspace overview
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{workspace.name}</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--fg-2)', fontSize: 13, maxWidth: 640 }}>
            {total} prompt{total !== 1 ? 's' : ''} across {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--line-1)', borderRadius: 'var(--r-3)' }}>
          {[
            { label: 'Prompts',  value: String(total),    sub: 'total' },
            { label: 'Bypassed', value: String(bypassed), sub: total ? `${Math.round(bypassed / total * 100)}% of tested` : '—', color: 'var(--st-bypassed)' },
            { label: 'Partial',  value: String(partial),  sub: total ? `${Math.round(partial / total * 100)}%` : '—', color: 'var(--st-partial)' },
            { label: 'Blocked',  value: String(blocked),  sub: total ? `${Math.round(blocked / total * 100)}%` : '—', color: 'var(--st-blocked)' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '16px 20px', borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)' }}>
              <div style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 500 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                {s.color && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color }} />}
                <div className="tnum" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              </div>
              <div className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Challenges table */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Challenges</h2>
              <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{challenges.length}</span>
            </div>
            <button onClick={() => navigate('/library?new=challenge')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', fontSize: 11.5, cursor: 'pointer', color: 'var(--fg-1)' }}>{I.plus} New challenge</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 96px 120px', gap: 16, padding: '8px 14px', borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)', fontSize: 10.5, color: 'var(--fg-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <div>ID</div><div>Challenge</div><div>Priority</div><div>Prompts</div><div>Coverage</div>
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {challenges.length === 0 && (
              <div style={{ padding: '32px 14px', color: 'var(--fg-3)', fontSize: 12.5 }}>No challenges yet. Create one to organize your prompts.</div>
            )}
            {challenges.map((c, idx) => (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 100px 96px 120px',
                gap: 16, padding: '10px 14px', borderBottom: '1px solid var(--line-1)',
                alignItems: 'center', fontSize: 12.5,
                background: idx % 2 === 0 ? 'transparent' : 'var(--bg-1)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>{c.challengeId}</div>
                <div style={{ color: 'var(--fg-0)', fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                <div>
                  <span style={{ fontSize: 10, padding: '1px 5px', border: '1px solid var(--line-2)', color: c.priority === 'P0' ? 'var(--st-blocked)' : 'var(--fg-2)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.priority}</span>
                </div>
                <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-1)' }}>{c.total}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bar blocked={c.blocked} partial={c.partial} bypassed={c.bypassed} total={c.total} />
                  <span className="tnum" style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                    {c.total ? Math.round(c.bypassed / c.total * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
