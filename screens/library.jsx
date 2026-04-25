/* global React, Sidebar, I, PROMPTS, StatusDot, StatusPill, Tag */

const PromptLibrary = () => {
  const selectedId = "P-0142";
  const selected = PROMPTS.find(p => p.id === selectedId);

  return (
    <div className="screen">
      <Sidebar active="library" />

      {/* Center panel */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column",
        borderRight: "1px solid var(--line-1)",
        minWidth: 0,
      }}>
        {/* Topbar */}
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ color: "var(--fg-3)" }}>{I.panelL}</span>
            <span style={{ color: "var(--fg-2)" }}>Prompts</span>
            <span style={{ color: "var(--fg-3)" }}>/</span>
            <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>All</span>
            <span className="tnum" style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>142</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <button className="btn btn-ghost"><span>{I.sliders}</span> Sort: updated</button>
            <button className="btn btn-ghost"><span>{I.filter}</span> Filter</button>
            <span style={{ width: 1, height: 18, background: "var(--line-1)", margin: "0 4px" }} />
            <button className="btn btn-primary"><span>{I.plus}</span> New</button>
          </div>
        </header>

        {/* Filter bar */}
        <div style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          background: "var(--bg-0)",
        }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px",
            background: "var(--bg-1)",
            border: "1px solid var(--line-1)",
            borderRadius: "var(--r-2)",
            flex: "0 0 280px",
            fontSize: 12,
            color: "var(--fg-1)",
          }}>
            <span style={{ color: "var(--fg-3)" }}>{I.search}</span>
            <span style={{ flex: 1, fontFamily: "var(--font-mono)", color: "var(--fg-0)" }}>
              tag:extraction status:!blocked
            </span>
            <span className="kbd">/</span>
          </div>

          {/* Active filter chips */}
          <span className="tag" style={{ borderColor: "var(--accent-line)", background: "var(--accent-dim)", color: "var(--fg-0)" }}>
            <span style={{ color: "var(--fg-2)" }}>tag:</span>extraction
            <span style={{ marginLeft: 2, color: "var(--fg-2)", fontSize: 12, cursor: "pointer" }}>×</span>
          </span>
          <span className="tag" style={{ borderColor: "var(--accent-line)", background: "var(--accent-dim)", color: "var(--fg-0)" }}>
            <span style={{ color: "var(--fg-2)" }}>status:</span>!blocked
            <span style={{ marginLeft: 2, color: "var(--fg-2)", fontSize: 12, cursor: "pointer" }}>×</span>
          </span>
          <button className="btn btn-ghost" style={{ padding: "3px 6px", fontSize: 11 }}>+ filter</button>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
              showing <span className="tnum" style={{ color: "var(--fg-1)" }}>11</span> of <span className="tnum">142</span>
            </span>
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>view:</span>
            <div style={{ display: "flex", border: "1px solid var(--line-1)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
              <button style={{ padding: "3px 8px", background: "var(--bg-2)", border: "none", color: "var(--fg-0)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-ui)" }}>list</button>
              <button style={{ padding: "3px 8px", background: "transparent", border: "none", color: "var(--fg-2)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-ui)", borderLeft: "1px solid var(--line-1)" }}>grid</button>
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {PROMPTS.map(p => {
            const isSelected = p.id === selectedId;
            return (
              <article key={p.id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--line-1)",
                background: isSelected ? "var(--bg-2)" : "transparent",
                borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                cursor: "pointer",
              }}>
                {/* Status dot column */}
                <div style={{ paddingTop: 5 }}>
                  <StatusDot status={p.status} size={8} />
                </div>

                {/* Body */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{p.id}</span>
                    <h3 style={{
                      margin: 0, fontSize: 13.5, fontWeight: 500,
                      color: "var(--fg-0)",
                      letterSpacing: "-0.005em",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: 460,
                    }}>{p.title}</h3>
                    {p.versions > 1 && (
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)",
                        display: "inline-flex", alignItems: "center", gap: 3,
                      }}>
                        <span style={{ display: "flex" }}>{I.branch}</span>v{p.versions}
                      </span>
                    )}
                  </div>

                  {/* Preview */}
                  <pre style={{
                    margin: "6px 0 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "var(--fg-2)",
                    lineHeight: 1.5,
                    maxHeight: 30,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    paddingLeft: 8,
                    borderLeft: "1px solid var(--line-1)",
                  }}>{p.preview.split("\n")[0]}</pre>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {p.tags.map(t => <Tag key={t} name={t} />)}
                    <span style={{ flex: 1 }} />
                  </div>
                </div>

                {/* Right meta column */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-end",
                  gap: 5, fontSize: 11, color: "var(--fg-3)",
                  fontFamily: "var(--font-mono)",
                  minWidth: 110,
                }}>
                  <StatusPill status={p.status} />
                  <span className="tnum">{p.updated}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "flex" }}>{I.history}</span>
                    <span className="tnum">{p.runs} runs</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Right panel — quick detail */}
      <aside style={{
        width: 380, flexShrink: 0,
        background: "var(--bg-0)",
        display: "flex", flexDirection: "column",
      }}>
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 8,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)" }}>{selected.id}</span>
          <StatusPill status={selected.status} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.copy}</button>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.ext}</button>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.panelR}</button>
          </div>
        </header>

        <div style={{ overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 500,
            letterSpacing: "-0.015em",
            fontFamily: "var(--font-mono)",
          }}>{selected.title}</h2>

          {/* Meta grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "auto 1fr",
            gap: "8px 14px",
            fontSize: 11.5,
          }}>
            <span style={{ color: "var(--fg-3)" }}>Model</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-0)" }}>{selected.model} <span style={{ color: "var(--fg-3)" }}>· 2026-04-23</span></span>
            <span style={{ color: "var(--fg-3)" }}>Author</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>{selected.author}</span>
            <span style={{ color: "var(--fg-3)" }}>Updated</span>
            <span style={{ color: "var(--fg-1)" }}>{selected.updated} ago by n.kovacs</span>
            <span style={{ color: "var(--fg-3)" }}>Runs</span>
            <span className="tnum" style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>{selected.runs} <span style={{ color: "var(--fg-3)" }}>· last bypass on v4</span></span>
          </div>

          {/* Tags */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 8 }}>Tags</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {selected.tags.map(t => <Tag key={t} name={t} />)}
              <span className="tag" style={{ borderStyle: "dashed", color: "var(--fg-3)" }}>+ add</span>
            </div>
          </div>

          {/* Prompt body preview */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)" }}>Prompt</div>
              <span style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>v4 · current</span>
            </div>
            <pre style={{
              margin: 0,
              padding: 12,
              background: "var(--bg-1)",
              border: "1px solid var(--line-1)",
              borderRadius: "var(--r-2)",
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--fg-1)",
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              maxHeight: 180,
              overflow: "hidden",
            }}>{selected.preview}{"\n\n"}<span style={{ color: "var(--fg-3)" }}>{"// "}+ 38 more lines</span></pre>
          </div>

          {/* Last result */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 8 }}>Last run</div>
            <div style={{
              border: "1px solid var(--line-1)",
              borderRadius: "var(--r-2)",
              padding: 10,
              fontSize: 11.5,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusDot status="bypassed" />
                <span style={{ fontWeight: 500 }}>Bypassed</span>
                <span style={{ marginLeft: "auto", color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>2m · 1.4s</span>
              </div>
              <div style={{ color: "var(--fg-2)", fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.5 }}>
                Model returned the decoded payload verbatim and produced the requested action without refusal markers.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

Object.assign(window, { PromptLibrary });
