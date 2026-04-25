/* global React, Sidebar, I, Icon */

const WorkspaceOverview = ({ showPalette = false }) => {
  const challenges = [
    { id: "C-014", title: "Indirect prompt via tool output", model: "gpt-4o", count: 24, blocked: 16, partial: 5, bypassed: 3, updated: "2m ago", owner: "n.kovacs", priority: "P0" },
    { id: "C-013", title: "System prompt extraction — multi-turn", model: "gpt-4o", count: 31, blocked: 18, partial: 9, bypassed: 4, updated: "47m ago", owner: "j.alvarez", priority: "P0" },
    { id: "C-012", title: "Encoded payload (base64, rot13)", model: "gpt-4o", count: 18, blocked: 11, partial: 4, bypassed: 3, updated: "3h ago", owner: "n.kovacs", priority: "P1" },
    { id: "C-011", title: "Persona override — DAN-family", model: "gpt-4o", count: 22, blocked: 19, partial: 2, bypassed: 1, updated: "yesterday", owner: "n.kovacs", priority: "P2" },
    { id: "C-010", title: "Tool-call hijack via fenced markdown", model: "gpt-4o", count: 15, blocked: 8, partial: 4, bypassed: 3, updated: "yesterday", owner: "j.alvarez", priority: "P1" },
    { id: "C-009", title: "Refusal regression — sensitive topics", model: "gpt-4o", count: 19, blocked: 14, partial: 3, bypassed: 2, updated: "3d ago", owner: "p.weil", priority: "P1" },
    { id: "C-008", title: "Translation pivot (low-resource → en)", model: "gpt-4o", count: 13, blocked: 9, partial: 2, bypassed: 2, updated: "5d ago", owner: "n.kovacs", priority: "P2" },
  ];

  const Bar = ({ blocked, partial, bypassed }) => {
    const total = blocked + partial + bypassed;
    return (
      <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", background: "var(--bg-3)", width: 96 }}>
        <div style={{ width: `${blocked / total * 100}%`, background: "var(--st-blocked)" }} />
        <div style={{ width: `${partial / total * 100}%`, background: "var(--st-partial)" }} />
        <div style={{ width: `${bypassed / total * 100}%`, background: "var(--st-bypassed)" }} />
      </div>
    );
  };

  return (
    <div className="screen">
      <Sidebar active="overview" />

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-0)" }}>
        {/* Topbar */}
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 18px", gap: 14,
        }}>
          <div style={{ fontSize: 12.5, color: "var(--fg-2)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>Workspace</span>
            <span style={{ color: "var(--fg-3)" }}>/</span>
            <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>gpt-4o · jailbreaks</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: "var(--fg-3)" }}>last sync 2m ago</span>
            <button className="btn"><span>{I.upload}</span> Import</button>
            <button className="btn btn-primary"><span>{I.plus}</span> New prompt</button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", padding: "28px 40px 0", display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Title block */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Q2 · Red team — sprint 14
            </div>
            <h1 style={{
              margin: "8px 0 0", fontSize: 26, fontWeight: 600,
              letterSpacing: "-0.02em", color: "var(--fg-0)",
            }}>
              gpt-4o · jailbreaks
            </h1>
            <p style={{ margin: "6px 0 0", color: "var(--fg-2)", fontSize: 13, maxWidth: 640 }}>
              142 prompts across 14 active challenges. Coverage stable; two regressions opened today on
              <span style={{ color: "var(--fg-0)" }}> C-014 </span>after the 2026-04-23 model refresh.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--line-1)", borderRadius: "var(--r-3)" }}>
            {[
              { label: "Prompts", value: "142", sub: "+8 this week" },
              { label: "Bypassed", value: "18", sub: "12.7% of tested", color: "var(--st-bypassed)" },
              { label: "Partial", value: "29", sub: "20.4%", color: "var(--st-partial)" },
              { label: "Blocked", value: "95", sub: "66.9%", color: "var(--st-blocked)" },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "16px 20px",
                borderLeft: i === 0 ? "none" : "1px solid var(--line-1)",
              }}>
                <div style={{ fontSize: 11, color: "var(--fg-2)", fontWeight: 500 }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  {s.color && <span className="dot" style={{ background: s.color, width: 8, height: 8 }} />}
                  <div className="tnum" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>{s.value}</div>
                </div>
                <div className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Challenges table */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 0 10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Challenges</h2>
                <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)" }}>14</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="btn btn-ghost"><span>{I.filter}</span> Filter</button>
                <button className="btn btn-ghost"><span>{I.sliders}</span> Group: priority</button>
              </div>
            </div>

            {/* Header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 100px 96px 120px 110px 90px 24px",
              gap: 16,
              padding: "8px 14px",
              borderTop: "1px solid var(--line-1)",
              borderBottom: "1px solid var(--line-1)",
              fontSize: 10.5,
              color: "var(--fg-3)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              <div>ID</div>
              <div>Challenge</div>
              <div>Model</div>
              <div>Prompts</div>
              <div>Coverage</div>
              <div>Updated</div>
              <div>Owner</div>
              <div></div>
            </div>

            {/* Rows */}
            <div style={{ overflow: "auto", flex: 1 }}>
              {challenges.map((c, idx) => (
                <div key={c.id} style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 100px 96px 120px 110px 90px 24px",
                  gap: 16,
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--line-1)",
                  alignItems: "center",
                  fontSize: 12.5,
                  background: idx === 0 ? "var(--bg-1)" : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 10, padding: "1px 5px",
                      border: "1px solid var(--line-2)",
                      color: c.priority === "P0" ? "var(--st-blocked)" : c.priority === "P1" ? "var(--fg-1)" : "var(--fg-3)",
                      borderRadius: 2, fontFamily: "var(--font-mono)", fontWeight: 600,
                    }}>{c.priority}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)" }}>{c.id}</span>
                  </div>
                  <div style={{ color: "var(--fg-0)", fontWeight: 450, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-1)" }}>{c.model}</div>
                  <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-1)" }}>
                    {c.count}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Bar blocked={c.blocked} partial={c.partial} bypassed={c.bypassed} />
                    <span className="tnum" style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
                      {Math.round(c.bypassed / c.count * 100)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{c.updated}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--fg-2)" }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: "var(--bg-3)", color: "var(--fg-1)",
                      display: "grid", placeItems: "center",
                      fontSize: 8.5, fontWeight: 600,
                    }}>{c.owner.split(".").map(p => p[0]).join("").toUpperCase()}</div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{c.owner}</span>
                  </div>
                  <div style={{ color: "var(--fg-3)", display: "flex", justifyContent: "flex-end" }}>{I.chevR}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Command palette overlay */}
      {showPalette && <CommandPalette />}
    </div>
  );
};

const CommandPalette = () => {
  const items = [
    { section: "Jump to", rows: [
      { icon: I.hash, label: "Open prompt by ID…", hint: "p:", mono: true },
      { icon: I.layers, label: "Open challenge…", hint: "c:" },
      { icon: I.tag, label: "Filter by tag…", hint: "t:" },
    ]},
    { section: "Recent prompts", rows: [
      { icon: <span className="dot" style={{ background: "var(--st-bypassed)" }} />, label: "encoded.b64.payload — extract system prompt", hint: "P-0142", mono: true, active: true },
      { icon: <span className="dot" style={{ background: "var(--st-partial)" }} />, label: "translation.pivot.uz — restricted topic", hint: "P-0140", mono: true },
      { icon: <span className="dot" style={{ background: "var(--st-blocked)" }} />, label: "indirect.tool-output.markdown", hint: "P-0139", mono: true },
    ]},
    { section: "Actions", rows: [
      { icon: I.plus, label: "New prompt", hint: "N" },
      { icon: I.upload, label: "Import chat export…", hint: "I" },
      { icon: I.branch, label: "Fork current prompt", hint: "⇧F" },
      { icon: I.flag, label: "Mark as bypassed", hint: "⌘⇧B" },
    ]},
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "oklch(0 0 0 / 0.55)",
      display: "flex", justifyContent: "center", paddingTop: 120,
      backdropFilter: "blur(2px)",
    }}>
      <div style={{
        width: 600, maxHeight: 480,
        background: "var(--bg-1)",
        border: "1px solid var(--line-2)",
        borderRadius: 10,
        boxShadow: "0 24px 60px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0 0 0 / 0.4)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px",
          borderBottom: "1px solid var(--line-1)",
        }}>
          <span style={{ color: "var(--fg-2)" }}>{I.search}</span>
          <input
            value="extract sys"
            readOnly
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--fg-0)", fontSize: 14,
              fontFamily: "var(--font-ui)",
              caretColor: "var(--accent)",
            }}
          />
          <span className="tag" style={{ fontFamily: "var(--font-mono)" }}>scope: workspace</span>
          <span className="kbd">esc</span>
        </div>

        {/* Results */}
        <div style={{ overflow: "auto", padding: "6px 0" }}>
          {items.map(group => (
            <div key={group.section}>
              <div style={{
                padding: "8px 16px 4px",
                fontSize: 10.5, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--fg-3)",
              }}>{group.section}</div>
              {group.rows.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 16px",
                  background: r.active ? "var(--bg-2)" : "transparent",
                  borderLeft: r.active ? "2px solid var(--accent)" : "2px solid transparent",
                  fontSize: 12.5,
                }}>
                  <span style={{ color: r.active ? "var(--fg-0)" : "var(--fg-2)", display: "flex" }}>{r.icon}</span>
                  <span style={{ flex: 1, color: r.active ? "var(--fg-0)" : "var(--fg-1)", fontFamily: r.mono ? "var(--font-mono)" : "var(--font-ui)", fontSize: r.mono ? 12 : 12.5 }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{r.hint}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px",
          borderTop: "1px solid var(--line-1)",
          display: "flex", alignItems: "center", gap: 14,
          fontSize: 11, color: "var(--fg-3)",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="kbd">↑↓</span> navigate
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="kbd">↵</span> open
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="kbd">⌘↵</span> open in split
          </span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)" }}>3 results</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { WorkspaceOverview, CommandPalette });
