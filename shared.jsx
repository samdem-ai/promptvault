/* global React */
const { useState } = React;

// ---------- Shared icons (stroke icons, no AI/robot imagery) ----------
const Icon = ({ d, size = 14, sw = 1.5, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
       style={{ flexShrink: 0 }}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const I = {
  search:   <Icon d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />,
  plus:     <Icon d="M12 5v14M5 12h14" />,
  filter:   <Icon d="M3 5h18M6 12h12M10 19h4" />,
  cmd:      <Icon d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" />,
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
  star:     <Icon d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  link:     <Icon d="M9 15l6-6M10 5h-3a5 5 0 0 0 0 10h3M14 19h3a5 5 0 0 0 0-10h-3" />,
  ext:      <Icon d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />,
  sliders:  <Icon d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h.01M14 4v4M8 10v4M16 16v4" />,
  flag:     <Icon d="M4 21V4M4 4h13l-2 4 2 4H4" />,
  branch:   <Icon d="M6 3v12M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9c0 6-12 4-12 8" />,
  diamond:  <Icon d="M12 2L2 12l10 10 10-10z" />,
  paste:    <Icon d="M9 3h6v3H9zM7 5h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
};

// ---------- Sidebar (used on all 5 screens) ----------
const Sidebar = ({ active = "library", workspace = "gpt-4o · jailbreaks" }) => {
  const wsList = [
    { id: "gpt4o", name: "gpt-4o · jailbreaks", count: 142 },
    { id: "claude", name: "claude-3.5 · refusal-bypass", count: 87 },
    { id: "gemini", name: "gemini-1.5 · system-prompt", count: 54 },
    { id: "llama", name: "llama-3.1 · safety-eval", count: 31 },
    { id: "scratch", name: "scratch", count: 12 },
  ];
  const navItems = [
    { id: "overview", icon: I.layers, label: "Overview" },
    { id: "library", icon: I.hash, label: "Prompts", count: 142 },
    { id: "import", icon: I.upload, label: "Import" },
    { id: "tags", icon: I.tag, label: "Tags" },
    { id: "runs", icon: I.history, label: "Runs", count: 38 },
    { id: "archive", icon: I.archive, label: "Archive" },
  ];
  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: "var(--bg-0)",
      borderRight: "1px solid var(--line-1)",
      display: "flex", flexDirection: "column",
      padding: "10px 0",
    }}>
      {/* Brand */}
      <div style={{ padding: "6px 14px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          background: "var(--fg-0)", color: "var(--bg-0)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
        }}>i</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, letterSpacing: "-0.02em" }}>
          inject<span style={{ color: "var(--fg-3)" }}>.dev</span>
        </div>
        <div style={{ marginLeft: "auto", color: "var(--fg-3)" }}>
          {I.panelL}
        </div>
      </div>

      {/* Workspace switcher */}
      <div style={{ padding: "0 10px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 8px",
          background: "var(--bg-1)",
          border: "1px solid var(--line-1)",
          borderRadius: "var(--r-2)",
          fontSize: 12, fontWeight: 500,
          cursor: "pointer",
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3,
            background: "oklch(0.45 0.13 280)",
          }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {workspace}
          </span>
          <span style={{ color: "var(--fg-3)" }}>{I.chevD}</span>
        </div>
      </div>

      {/* Search trigger */}
      <div style={{ padding: "10px 10px 6px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px",
          color: "var(--fg-2)",
          fontSize: 12,
          border: "1px solid transparent",
          borderRadius: "var(--r-2)",
          cursor: "pointer",
        }}>
          <span>{I.search}</span>
          <span style={{ flex: 1 }}>Search…</span>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "4px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map(n => {
          const isActive = n.id === active;
          return (
            <div key={n.id} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "5px 8px",
              borderRadius: "var(--r-2)",
              fontSize: 12.5,
              color: isActive ? "var(--fg-0)" : "var(--fg-1)",
              background: isActive ? "var(--bg-2)" : "transparent",
              cursor: "pointer",
            }}>
              <span style={{ color: isActive ? "var(--accent)" : "var(--fg-2)" }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.count != null && (
                <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)" }}>{n.count}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Workspaces list */}
      <div style={{ marginTop: 18, padding: "0 10px" }}>
        <div style={{
          padding: "0 8px 6px",
          fontSize: 10.5, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--fg-3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>Workspaces</span>
          <span style={{ cursor: "pointer", color: "var(--fg-2)" }}>{I.plus}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {wsList.map(w => {
            const isActive = w.name === workspace;
            return (
              <div key={w.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 8px",
                borderRadius: "var(--r-2)",
                fontSize: 12,
                color: isActive ? "var(--fg-0)" : "var(--fg-1)",
                background: isActive ? "var(--bg-2)" : "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                letterSpacing: "-0.01em",
              }}>
                <span className="dot" style={{ background: isActive ? "var(--accent)" : "var(--fg-3)" }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {w.name}
                </span>
                <span className="tnum" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{w.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "auto",
        padding: "10px 14px",
        borderTop: "1px solid var(--line-1)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11.5, color: "var(--fg-2)",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: "var(--bg-3)",
          display: "grid", placeItems: "center",
          fontSize: 10, fontWeight: 600, color: "var(--fg-1)",
        }}>NK</div>
        <span style={{ flex: 1 }}>n.kovacs</span>
        <span className="dot" style={{ background: "var(--st-bypassed)" }} title="synced" />
      </div>
    </aside>
  );
};

// Make available across babel scripts
Object.assign(window, { Icon, I, Sidebar });
