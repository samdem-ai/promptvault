import type { PromptStatus } from '../../db/schema';

const cfg: Record<PromptStatus, { label: string; color: string }> = {
  bypassed: { label: 'bypassed', color: 'var(--st-bypassed)' },
  partial:  { label: 'partial',  color: 'var(--st-partial)' },
  blocked:  { label: 'blocked',  color: 'var(--st-blocked)' },
  untested: { label: 'untested', color: 'var(--st-untested)' },
};

export function StatusPill({ status }: { status: PromptStatus }) {
  const { label, color } = cfg[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px 2px 6px',
      border: '1px solid var(--line-1)',
      borderRadius: 999, fontSize: 10.5,
      fontFamily: 'var(--font-mono)',
      color: 'var(--fg-1)', background: 'var(--bg-1)',
      letterSpacing: '-0.01em',
    }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}
