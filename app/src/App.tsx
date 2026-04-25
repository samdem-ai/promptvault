import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './db/db';
import { useUIStore } from './store/ui';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/palette/CommandPalette';
import { Overview } from './screens/Overview';
import { Challenges } from './screens/Challenges';
import { Library } from './screens/Library';
import { PromptDetail } from './screens/PromptDetail';
import { Import } from './screens/Import';
import { Tags } from './screens/Tags';
import { Runs } from './screens/Runs';
import { Archive } from './screens/Archive';
import { Onboarding } from './screens/Onboarding';
import './styles/global.css';

function useKeyboardShortcuts() {
  const { openPalette } = useUIStore();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openPalette();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openPalette]);
}

function AppShell() {
  useKeyboardShortcuts();
  const { paletteOpen } = useUIStore();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-0)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/challenges" replace />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:challengeId" element={<Challenges />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:promptId" element={<Library />} />
          <Route path="/prompts/:promptId" element={<PromptDetail />} />
          <Route path="/import" element={<Import />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tags/:tagName" element={<Tags />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
      {paletteOpen && <CommandPalette />}
    </div>
  );
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { activeWorkspaceId, setActiveWorkspace } = useUIStore();

  useEffect(() => {
    db.workspaces.count().then(async count => {
      if (count === 0) {
        setNeedsOnboarding(true);
      } else if (activeWorkspaceId == null) {
        const first = await db.workspaces.toCollection().first();
        if (first?.id) setActiveWorkspace(first.id);
      }
      setChecking(false);
    });
  }, []);

  if (checking) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', color: 'var(--fg-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
      loading…
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {needsOnboarding
          ? <Route path="*" element={<Onboarding onComplete={() => setNeedsOnboarding(false)} />} />
          : <Route path="*" element={<AppShell />} />
        }
      </Routes>
    </BrowserRouter>
  );
}
