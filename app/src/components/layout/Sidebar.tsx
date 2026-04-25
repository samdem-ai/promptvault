import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspaces } from '../../db/hooks/useWorkspaces';
import { useUIStore } from '../../store/ui';
import { I } from '../atoms/Icon';

const NAV = [
  { id: 'challenges', path: '/challenges', icon: I.flag,    label: 'Challenges' },
  { id: 'library',    path: '/library',    icon: I.hash,    label: 'Prompts' },
  { id: 'runs',       path: '/runs',       icon: I.history, label: 'Runs' },
  { id: 'overview',   path: '/overview',   icon: I.layers,  label: 'Overview' },
  { id: 'import',     path: '/import',     icon: I.upload,  label: 'Import' },
  { id: 'tags',       path: '/tags',       icon: I.tag,     label: 'Tags' },
  { id: 'archive',    path: '/archive',    icon: I.archive, label: 'Archive' },
];

const COLORS = [
  'oklch(0.45 0.13 280)', 'oklch(0.55 0.15 25)',
  'oklch(0.55 0.14 145)', 'oklch(0.55 0.13 200)',
  'oklch(0.55 0.14 65)',  'oklch(0.50 0.12 320)',
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaces = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspace, openPalette } = useUIStore();
  const activeWs = workspaces.find(w => w.id === activeWorkspaceId);
  const [wsOpen, setWsOpen] = useState(false);
  const wsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wsOpen) return;
    const handle = (e: MouseEvent) => {
      if (!wsRef.current?.contains(e.target as Node)) setWsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [wsOpen]);

  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: 'var(--bg-0)',
      borderRight: '1px solid var(--line-1)',
      display: 'flex', flexDirection: 'column',
      padding: '10px 0',
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '6px 14px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          background: 'var(--fg-0)', color: 'var(--bg-0)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        }}>i</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '-0.02em' }}>
          inject<span style={{ color: 'var(--fg-3)' }}>.dev</span>
        </div>
      </div>

      {/* Workspace switcher */}
      <div ref={wsRef} style={{ padding: '0 10px', position: 'relative' }}>
        <button onClick={() => setWsOpen(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 8px',
          background: wsOpen ? 'var(--bg-2)' : 'var(--bg-1)', border: '1px solid var(--line-1)',
          borderRadius: 'var(--r-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--fg-0)',
        }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: activeWs?.color ?? 'var(--bg-3)', flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
            {activeWs?.name ?? 'No workspace'}
          </span>
          <span style={{ color: 'var(--fg-3)', transform: wsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>{I.chevD}</span>
        </button>

        {wsOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 10, right: 10, zIndex: 200, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
            {workspaces.map((w, i) => (
              <button key={w.id} onClick={() => { setActiveWorkspace(w.id!); setWsOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--fg-0)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em',
                borderBottom: i < workspaces.length - 1 ? '1px solid var(--line-1)' : 'none',
              }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: w.color || COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{w.name}</span>
                {w.id === activeWorkspaceId && <span style={{ color: 'var(--accent)', display: 'flex' }}>{I.check}</span>}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--line-1)' }}>
              <button onClick={() => { navigate('/onboarding'); setWsOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--fg-2)',
              }}>
                <span style={{ display: 'flex', color: 'var(--fg-3)' }}>{I.plus}</span>
                New workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '10px 10px 6px' }}>
        <button onClick={openPalette} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', width: '100%',
          color: 'var(--fg-2)', fontSize: 12,
          border: 'none', borderRadius: 'var(--r-2)',
          background: 'transparent', cursor: 'pointer',
        }}>
          <span>{I.search}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5,
            padding: '2px 5px', border: '1px solid var(--line-1)',
            borderBottomWidth: 2, borderRadius: 'var(--r-1)',
            color: 'var(--fg-1)', background: 'var(--bg-1)',
          }}>⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV.map(n => {
          const isActive = location.pathname.startsWith(n.path);
          return (
            <button key={n.id} onClick={() => navigate(n.path)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '5px 8px', borderRadius: 'var(--r-2)',
              fontSize: 12.5,
              color: isActive ? 'var(--fg-0)' : 'var(--fg-1)',
              background: isActive ? 'var(--bg-2)' : 'transparent',
              border: 'none', cursor: 'pointer', width: '100%',
            }}>
              <span style={{ color: isActive ? 'var(--accent)' : 'var(--fg-2)' }}>{n.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto', padding: '10px 14px',
        borderTop: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11.5, color: 'var(--fg-2)',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--bg-3)', display: 'grid', placeItems: 'center',
          fontSize: 9, fontWeight: 600, color: 'var(--fg-1)',
        }}>
          {useUIStore.getState().authorName.slice(0, 2).toUpperCase()}
        </div>
        <span style={{ flex: 1 }}>{useUIStore.getState().authorName}</span>
        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--st-bypassed)' }} title="local" />
      </div>
    </aside>
  );
}
