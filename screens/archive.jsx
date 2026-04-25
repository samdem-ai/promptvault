/* global React, Sidebar, I, StatusDot, StatusPill, Tag, TAG_COLORS */

const ArchiveScreen = () => {
  const archived = [
    { id: "P-0098", title: "legacy.jailbreak.grandma-exploit", status: "blocked", tags: ["persona", "DAN-family"], model: "gpt-4o", updated: "Mar 12", author: "n.kovacs", versions: 3, runs: 14, archivedDate: "Apr 1", reason: "patched in model update" },
    { id: "P-0089", title: "token.smuggling.unicode-zwj", status: "bypassed", tags: ["encoding"], model: "gpt-3.5", updated: "Feb 28", author: "j.alvarez", versions: 7, runs: 31, archivedDate: "Mar 28", reason: "model deprecated" },
    { id: "P-0077", title: "role.play.compliance-officer", status: "partial", tags: ["persona", "extraction"], model: "gpt-4o", updated: "Feb 10", author: "p.weil", versions: 2, runs: 8, archivedDate: "Mar 15", reason: "superseded by P-0138" },
    { id: "P-0065", title: "prompt.injection.via.base64.wrapped", status: "blocked", tags: ["encoding", "indirect"], model: "gpt-4o", updated: "Jan 22", author: "n.kovacs", versions: 4, runs: 19, archivedDate: "Mar 10", reason: "consistently blocked, no variants" },
    { id: "P-0054", title: "system.prompt.repeat-after-me", status: "bypassed", tags: ["extraction", "multi-turn"], model: "gpt-4o", updated: "Jan 15", author: "n.kovacs", versions: 2, runs: 6, archivedDate: "Feb 28", reason: "moved to reference library" },
    { id: "P-0041", title: "context.override.xml-tags", status: "blocked", tags: ["context", "encoding"], model: "gpt-4o", updated: "Dec 18", author: "j.alvarez", versions: 5, runs: 23, archivedDate: "Feb 14", reason: "fixed in safety update" },
    { id: "P-0033", title: "tool.hijack.via.image-description", status: "partial", tags: ["multimodal", "tool-use"], model: "gpt-4o", updated: "Dec 5", author: "p.weil", versions: 1, runs: 3, archivedDate: "Jan 30", reason: "out of scope for current sprint" },
    { id: "P-0021", title: "encoding.morse.hidden-instruction", status: "blocked", tags: ["encoding"], model: "gpt-3.5", updated: "Nov 19", author: "n.kovacs", versions: 2, runs: 7, archivedDate: "Jan 15", reason: "model deprecated" },
  ];

  const selected = archived[1];

  return (
    <div className="screen">
      <Sidebar active="archive" />

      {/* Center: archived list */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column",
        borderRight: "1px solid var(--line-1)",
        minWidth: 0,
      }}>
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 10,
        }}>
          <span style={{ color: "var(--fg-2)" }}>{I.archive}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Archive</span>
          <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>8</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11.5 }}>{I.sliders} Sort: archived</button>
            <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11.5 }}>{I.filter} Filter</button>
          </div>
        </header>

        {/* Filter bar */}
        <div style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-0)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px",
            background: "var(--bg-1)",
            border: "1px solid var(--line-1)",
            borderRadius: "var(--r-2)",
            flex: "0 0 260px",
            fontSize: 12, color: "var(--fg-3)",
          }}>
            <span style={{ color: "var(--fg-3)" }}>{I.search}</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>Search archive…</span>
          </div>
          <span style={{ fontSize: 11.5, color: "var(--fg-3)", marginLeft: "auto" }}>
            <span className="tnum" style={{ color: "var(--fg-1)", fontFamily: "var(--font-mono)" }}>8</span> archived prompts
          </span>
        </div>

        {/* Column header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 120px 100px 90px 90px",
          gap: 12, padding: "8px 14px",
          borderBottom: "1px solid var(--line-1)",
          fontSize: 10.5, color: "var(--fg-3)",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          <div>ID</div>
          <div>Title</div>
          <div>Reason</div>
          <div>Status</div>
          <div>Archived</div>
          <div>Author</div>
        </div>

        {/* Rows */}
        <div style={{ overflow: "auto", flex: 1 }}>
          {archived.map((p) => {
            const isSelected = p.id === selected.id;
            return (
              <div key={p.id} style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 120px 100px 90px 90px",
                gap: 12,
                padding: "10px 14px",
                borderBottom: "1px solid var(--line-1)",
                borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                background: isSelected ? "var(--bg-2)" : "transparent",
                alignItems: "center",
                cursor: "pointer",
                opacity: 0.85,
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)" }}>{p.id}</div>
                <div style={{
                  fontSize: 12.5, color: "var(--fg-0)", fontWeight: 450,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{p.title}</div>
                <div style={{
                  fontSize: 11, color: "var(--fg-3)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontStyle: "italic",
                }}>{p.reason}</div>
                <div><StatusPill status={p.status} /></div>
                <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{p.archivedDate}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)" }}>{p.author}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: detail */}
      <aside style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 8,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)" }}>{selected.id}</span>
          <StatusPill status={selected.status} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.copy}</button>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.ext}</button>
          </div>
        </header>

        <div style={{ overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "2px 8px", borderRadius: "var(--r-1)",
              background: "var(--bg-3)", fontSize: 10.5, color: "var(--fg-2)",
              fontFamily: "var(--font-mono)", marginBottom: 8,
            }}>
              {I.archive} <span>archived {selected.archivedDate}</span>
            </div>
            <h2 style={{
              margin: 0, fontSize: 14.5, fontWeight: 500,
              letterSpacing: "-0.015em", fontFamily: "var(--font-mono)",
              lineHeight: 1.4, color: "var(--fg-1)",
            }}>{selected.title}</h2>
          </div>

          {/* Archive reason */}
          <div style={{
            padding: "10px 12px",
            border: "1px solid var(--line-1)",
            borderRadius: "var(--r-2)",
            background: "var(--bg-1)",
            fontSize: 12, color: "var(--fg-2)",
            lineHeight: 1.5,
          }}>
            <span style={{ color: "var(--fg-3)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
              Reason archived
            </span>
            {selected.reason}
          </div>

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "7px 14px", fontSize: 11.5 }}>
            <span style={{ color: "var(--fg-3)" }}>Model</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>{selected.model}</span>
            <span style={{ color: "var(--fg-3)" }}>Author</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>{selected.author}</span>
            <span style={{ color: "var(--fg-3)" }}>Versions</span>
            <span className="tnum" style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>v{selected.versions}</span>
            <span style={{ color: "var(--fg-3)" }}>Runs</span>
            <span className="tnum" style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>{selected.runs}</span>
          </div>

          {/* Tags */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 8 }}>Tags</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {selected.tags.map(t => (
                <span key={t} className="tag">
                  <span className="dot" style={{ background: TAG_COLORS[t] || "var(--fg-3)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderTop: "1px solid var(--line-1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn" style={{ justifyContent: "center", gap: 8 }}>
              {I.inbox} Restore to library
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: "center", gap: 8, color: "var(--st-blocked)" }}>
              {I.x} Delete permanently
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

Object.assign(window, { ArchiveScreen });
