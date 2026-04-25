import { useState, useCallback } from 'react';
import { useUIStore } from '../store/ui';
import { useImports, createImportLog } from '../db/hooks/useImports';
import { createPrompt } from '../db/hooks/usePrompts';
import { detectFormat, parseAny } from '../lib/parsers';
import type { Format } from '../lib/parsers';
import { I } from '../components/atoms/Icon';


export function Import() {
  const { activeWorkspaceId, authorName } = useUIStore();
  const imports = useImports(activeWorkspaceId);
  const [raw, setRaw] = useState('');
  const [formatOverride, setFormatOverride] = useState<Format | 'auto'>('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<{ count: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const detectedFormat = raw ? detectFormat(raw) : null;
  const activeFormat = formatOverride === 'auto' ? (detectedFormat ?? 'markdown') : formatOverride;

  const handleParse = () => {
    if (!raw.trim()) return;
    const result = parseAny(raw, activeFormat);
    setPreview({ count: result.prompts.length, errors: result.errors });
  };

  const handleImport = async () => {
    if (!activeWorkspaceId || !raw.trim()) return;
    setImporting(true);
    try {
      const result = parseAny(raw, activeFormat);
      await Promise.all(result.prompts.map(p =>
        createPrompt({
          workspaceId: activeWorkspaceId,
          challengeId: null,
          title: p.title,
          tags: p.tags,
          status: 'untested',
          modelLabel: p.modelLabel,
          author: authorName,
          archived: false, archivedAt: null, archiveReason: '',
        }, p.body, 'Imported', authorName)
      ));
      await createImportLog({
        sourceName: 'paste',
        workspaceId: activeWorkspaceId,
        parsedCount: result.prompts.length,
        status: result.errors.length === 0 ? 'done' : 'error',
        errorMessage: result.errors.length ? result.errors.join('; ') : null,
      });
      setRaw(''); setPreview(null); setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const handleFileRead = (text: string) => {
    setRaw(text);
    setPreview(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => handleFileRead(ev.target?.result as string);
    reader.readAsText(file);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => handleFileRead(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Left: upload area */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line-1)', minWidth: 0 }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 18px' }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Import</span>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Drop zone */}
          <label onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} style={{
            border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--line-2)'}`,
            borderRadius: 'var(--r-3)', padding: '32px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            background: isDragging ? 'var(--accent-dim)' : 'var(--bg-1)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', border: '1px solid var(--line-2)', background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--fg-2)' }}>{I.upload}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Drop export file here</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 3 }}>or <span style={{ color: 'var(--accent)' }}>browse file</span></div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['.json', '.txt', '.md'].map(ext => (
                <span key={ext} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', border: '1px solid var(--line-1)', borderRadius: 'var(--r-1)', background: 'var(--bg-0)', color: 'var(--fg-2)' }}>{ext}</span>
              ))}
            </div>
            <input type="file" accept=".json,.txt,.md,.csv" onChange={onFileInput} style={{ display: 'none' }} />
          </label>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
            <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>or paste directly</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
          </div>

          {/* Format selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Format:</span>
            {(['auto', 'chatgpt', 'claude', 'raw-json', 'markdown'] as const).map(f => (
              <button key={f} onClick={() => setFormatOverride(f)} style={{ padding: '2px 8px', background: formatOverride === f ? 'var(--bg-3)' : 'transparent', border: '1px solid var(--line-1)', borderRadius: 'var(--r-1)', fontSize: 10.5, color: formatOverride === f ? 'var(--fg-0)' : 'var(--fg-2)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                {f === 'auto' ? `auto${detectedFormat ? ` (${detectedFormat})` : ''}` : f}
              </button>
            ))}
          </div>

          {/* Paste area */}
          <textarea value={raw} onChange={e => { setRaw(e.target.value); setPreview(null); }}
            placeholder={"Paste chat export JSON, conversation text, or raw prompts…\n\nSeparate multiple prompts with ---"}
            style={{ width: '100%', height: 200, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-1)', lineHeight: 1.55, resize: 'none', outline: 'none' }} />

          {preview && (
            <div style={{ padding: '10px 14px', background: preview.errors.length ? 'oklch(0.66 0.18 25 / 0.1)' : 'var(--accent-dim)', border: `1px solid ${preview.errors.length ? 'var(--st-blocked)' : 'var(--accent-line)'}`, borderRadius: 'var(--r-2)', fontSize: 12.5 }}>
              {preview.errors.length === 0
                ? `✓ Found ${preview.count} prompt${preview.count !== 1 ? 's' : ''} — ready to import`
                : `${preview.count} prompts, ${preview.errors.length} error(s): ${preview.errors[0]}`
              }
            </div>
          )}

          {done && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-2)', fontSize: 12.5, color: 'var(--fg-0)' }}>
              ✓ Import complete
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleParse} disabled={!raw.trim()} style={{ padding: '6px 12px', background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-0)' }}>Preview</button>
            <button onClick={handleImport} disabled={!raw.trim() || importing || !activeWorkspaceId} style={{ padding: '6px 12px', background: 'var(--fg-0)', border: '1px solid var(--fg-0)', borderRadius: 'var(--r-2)', cursor: 'pointer', fontSize: 12, color: 'var(--bg-0)', fontWeight: 500 }}>
              {importing ? 'Importing…' : 'Import'}
            </button>
            {raw && <button onClick={() => { setRaw(''); setPreview(null); }} style={{ padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--fg-3)' }}>Clear</button>}
          </div>
        </div>
      </section>

      {/* Right: recent imports */}
      <aside style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 44, flexShrink: 0, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Recent imports</span>
          <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{imports.length}</span>
        </header>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {imports.length === 0 && <div style={{ padding: '24px 16px', color: 'var(--fg-3)', fontSize: 12.5 }}>No imports yet.</div>}
          {imports.map(imp => (
            <div key={imp.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: imp.status === 'done' ? 'var(--st-bypassed)' : 'var(--st-blocked)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-0)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imp.sourceName}</span>
                <span className="tnum" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{new Date(imp.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ paddingLeft: 14, marginTop: 3, fontSize: 11, color: imp.status === 'error' ? 'var(--st-blocked)' : 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>
                {imp.status === 'error' ? (imp.errorMessage ?? 'parse error') : `${imp.parsedCount} prompts · ${imp.importId}`}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
