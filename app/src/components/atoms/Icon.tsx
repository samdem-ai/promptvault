import React from 'react';

interface IconProps {
  d: string | React.ReactNode;
  size?: number;
  sw?: number;
  fill?: string;
}

export const Icon = ({ d, size = 14, sw = 1.5, fill }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

export const I = {
  search:   <Icon d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />,
  plus:     <Icon d="M12 5v14M5 12h14" />,
  filter:   <Icon d="M3 5h18M6 12h12M10 19h4" />,
  arrowR:   <Icon d="M5 12h14M13 6l6 6-6 6" />,
  chevR:    <Icon d="M9 6l6 6-6 6" />,
  chevD:    <Icon d="M6 9l6 6 6-6" />,
  inbox:    <Icon d="M3 13h5l1 3h6l1-3h5M3 13l3-8h12l3 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />,
  archive:  <Icon d="M3 6h18M5 6v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6M9 11h6" />,
  layers:   <Icon d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />,
  tag:      <Icon d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9zM7 7h.01" />,
  hash:     <Icon d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />,
  clock:    <Icon d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  history:  <Icon d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2" />,
  upload:   <Icon d="M12 16V4M6 10l6-6 6 6M4 20h16" />,
  download: <Icon d="M12 4v12M6 10l6 6 6-6M4 20h16" />,
  copy:     <Icon d="M8 8h11v13H8zM5 16V3h11" />,
  more:     <Icon d="M5 12h.01M12 12h.01M19 12h.01" sw={2.5} />,
  panelL:   <Icon d="M3 4h18v16H3zM9 4v16" />,
  panelR:   <Icon d="M3 4h18v16H3zM15 4v16" />,
  check:    <Icon d="M5 12l5 5 9-11" sw={2} />,
  x:        <Icon d="M5 5l14 14M19 5L5 19" />,
  edit:     <Icon d="M4 20h4l11-11-4-4L4 16v4zM13 6l4 4" />,
  link:     <Icon d="M9 15l6-6M10 5h-3a5 5 0 0 0 0 10h3M14 19h3a5 5 0 0 0 0-10h-3" />,
  ext:      <Icon d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />,
  sliders:  <Icon d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h.01M14 4v4M8 10v4M16 16v4" />,
  flag:     <Icon d="M4 21V4M4 4h13l-2 4 2 4H4" />,
  branch:   <Icon d="M6 3v12M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9c0 6-12 4-12 8" />,
  paste:    <Icon d="M9 3h6v3H9zM7 5h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  star:     <Icon d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  trash:    <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  restore:  <Icon d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
};
