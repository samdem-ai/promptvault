import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace } from '../db/hooks/useWorkspaces';
import { useUIStore } from '../store/ui';
import { seedDatabase } from '../lib/seed';

const COLORS = [
  'oklch(0.45 0.13 280)', 'oklch(0.55 0.15 25)',
  'oklch(0.55 0.14 145)', 'oklch(0.55 0.13 200)',
  'oklch(0.55 0.14 65)',  'oklch(0.50 0.12 320)',
];

export function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { setActiveWorkspace, setAuthorName } = useUIStore();
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [useSeed, setUseSeed] = useState(true);

  const handleStart = async () => {
    if (!useSeed && !name.trim()) return;
    setLoading(true);
    if (author.trim()) setAuthorName(author.trim());
    try {
      if (useSeed) {
        await seedDatabase();
        const { db } = await import('../db/db');
        const ws = await db.workspaces.toCollection().first();
        if (ws?.id) setActiveWorkspace(ws.id);
      } else {
        const id = await createWorkspace({ name: name.trim(), color, systemPromptNotes: '' });
        setActiveWorkspace(id);
      }
      onComplete?.();
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 440, padding: '36px 40px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--fg-0)', color: 'var(--bg-0)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>i</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>inject<span style={{ color: 'var(--fg-3)' }}>.dev</span></div>
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Get started</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>Local-first prompt injection organizer. All data stays in your browser.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', display: 'block', marginBottom: 6 }}>Your name</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="researcher"
              style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)' }} />
          </div>

          {/* Seed option */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={useSeed} onChange={e => setUseSeed(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Load sample data</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 2, lineHeight: 1.4 }}>Loads 2 Gray Swan workspaces: <b style={{color:'var(--fg-2)'}}>Safeguards</b> (365 prompts, 32 challenges) and <b style={{color:'var(--fg-2)'}}>Staged Attacks</b> (325 prompts, 12 challenges) — all successful submissions.</div>
              </div>
            </label>
          </div>

          {!useSeed && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', display: 'block', marginBottom: 6 }}>First workspace name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="gpt-4o · jailbreaks"
                style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', color: 'var(--fg-0)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: c === color ? '2px solid var(--fg-0)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleStart} disabled={loading || (!useSeed && !name.trim())} style={{ padding: '10px 0', background: 'var(--fg-0)', border: 'none', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 13, color: 'var(--bg-0)', fontWeight: 600, letterSpacing: '-0.005em' }}>
          {loading ? (useSeed ? 'Importing 690 prompts across 2 workspaces… (~20s)' : 'Setting up…') : 'Open inject.dev →'}
        </button>
      </div>
    </div>
  );
}
