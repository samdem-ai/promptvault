import type { PromptStatus } from '../../db/schema';

const colors: Record<PromptStatus, string> = {
  bypassed: 'var(--st-bypassed)',
  partial:  'var(--st-partial)',
  blocked:  'var(--st-blocked)',
  untested: 'var(--st-untested)',
};

export function StatusDot({ status, size = 7 }: { status: PromptStatus; size?: number }) {
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: size, height: size, borderRadius: '50%',
      background: colors[status],
    }} title={status} />
  );
}
