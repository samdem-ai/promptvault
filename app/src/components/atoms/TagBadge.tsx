export const TAG_COLORS: Record<string, string> = {
  encoding:       'oklch(0.74 0.13 235)',
  extraction:     'oklch(0.75 0.13 305)',
  'multi-turn':   'oklch(0.78 0.10 145)',
  indirect:       'oklch(0.74 0.13 35)',
  document:       'oklch(0.7 0.06 270)',
  translation:    'oklch(0.75 0.12 200)',
  'low-resource': 'oklch(0.7 0.06 270)',
  'tool-use':     'oklch(0.78 0.13 85)',
  persona:        'oklch(0.72 0.15 0)',
  'DAN-family':   'oklch(0.7 0.06 270)',
  fenced:         'oklch(0.7 0.06 270)',
  context:        'oklch(0.7 0.06 270)',
  multimodal:     'oklch(0.74 0.13 320)',
  json:           'oklch(0.7 0.06 270)',
};

interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: () => void;
}

export function TagBadge({ name, color, onRemove }: TagBadgeProps) {
  const c = color ?? TAG_COLORS[name] ?? 'var(--fg-3)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-mono)', fontSize: 10.5,
      padding: onRemove ? '2px 4px 2px 5px' : '2px 6px 2px 5px',
      borderRadius: 'var(--r-1)',
      border: '1px solid var(--line-1)',
      background: 'var(--bg-1)', color: 'var(--fg-1)',
      lineHeight: 1.2, letterSpacing: '-0.01em',
    }}>
      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: c }} />
      {name}
      {onRemove && (
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg-3)', fontSize: 12, lineHeight: 1, padding: 0,
          display: 'flex', alignItems: 'center',
        }}>×</button>
      )}
    </span>
  );
}
