/* global React, Sidebar, I, Icon */

const ImportScreen = () => {
  const recentImports = [
    { id: "IMP-031", source: "chatgpt-export.json", prompts: 14, workspace: "gpt-4o · jailbreaks", date: "2m ago", status: "done" },
    { id: "IMP-030", source: "claude-conversation.txt", prompts: 6, workspace: "claude-3.5 · refusal-bypass", date: "1h ago", status: "done" },
    { id: "IMP-029", source: "paste — 3 prompts", prompts: 3, workspace: "gpt-4o · jailbreaks", date: "3h ago", status: "done" },
    { id: "IMP-028", source: "gemini-export.json", prompts: 11, workspace: "gemini-1.5 · system-prompt", date: "yesterday", status: "done" },
    { id: "IMP-027", source: "raw-prompts.md", prompts: 0, workspace: "—", date: "yesterday", status: "error" },
    { id: "IMP-026", source: "llm-red-team-session.json", prompts: 22, workspace: "llama-3.1 · safety-eval", date: "2d ago", status: "done" },
  ];

  const formats = [
    { label: "ChatGPT export", hint: "conversations.json", icon: I.inbox },
    { label: "Claude export", hint: "claude.ai conversation JSON", icon: I.inbox },
    { label: "Raw JSON", hint: "array of prompt strings", icon: I.archive },
    { label: "Markdown / plain text", hint: "one prompt per --- separator", icon: I.paste },
  ];

  return (
    <div className="screen">
      <Sidebar active="import" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-0)", minWidth: 0 }}>
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
            <span style={{ color: "var(--fg-3)" }}>/</span>
            <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>Import</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "var(--fg-3)" }}>31 imports total</span>
          </div>
        </header>

        <div style={{ flex: 1, overflow: "auto", display: "flex", gap: 0 }}>
          {/* Left: upload area */}
          <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, borderRight: "1px solid var(--line-1)" }}>

            {/* Drop zone */}
            <div>
              <div style={{
                border: "1.5px dashed var(--line-2)",
                borderRadius: "var(--r-3)",
                padding: "40px 32px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                background: "var(--bg-1)",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--r-3)",
                  border: "1px solid var(--line-2)",
                  background: "var(--bg-2)",
                  display: "grid", placeItems: "center",
                  color: "var(--fg-2)",
                }}>
                  {I.upload}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg-0)" }}>
                    Drop export file here
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>
                    or <span style={{ color: "var(--accent)", cursor: "pointer" }}>browse file</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                  {[".json", ".txt", ".md", ".csv"].map(ext => (
                    <span key={ext} className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{ext}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--line-1)" }} />
              <span style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>or paste directly</span>
              <div style={{ flex: 1, height: 1, background: "var(--line-1)" }} />
            </div>

            {/* Paste area */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)" }}>
                  Paste content
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["auto-detect", "json", "plain text"].map((f, i) => (
                    <button key={f} style={{
                      padding: "2px 8px",
                      background: i === 0 ? "var(--bg-3)" : "transparent",
                      border: "1px solid var(--line-1)",
                      borderRadius: "var(--r-1)",
                      fontSize: 10.5, color: i === 0 ? "var(--fg-0)" : "var(--fg-2)",
                      fontFamily: "var(--font-mono)", cursor: "pointer",
                    }}>{f}</button>
                  ))}
                </div>
              </div>
              <textarea
                readOnly
                placeholder={"Paste chat export JSON, conversation text, or raw prompts…\n\nSeparate multiple prompts with ---"}
                style={{
                  width: "100%", height: 180,
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-1)",
                  borderRadius: "var(--r-2)",
                  padding: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5, color: "var(--fg-1)",
                  lineHeight: 1.55, resize: "none",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: "var(--fg-3)", flex: 1 }}>
                  Destination: <span style={{ color: "var(--fg-1)", fontFamily: "var(--font-mono)" }}>gpt-4o · jailbreaks</span>
                  <span style={{ color: "var(--accent)", marginLeft: 6, cursor: "pointer" }}>change</span>
                </span>
                <button className="btn btn-ghost" style={{ fontSize: 11.5 }}>{I.x} Clear</button>
                <button className="btn btn-primary">{I.upload} Parse & import</button>
              </div>
            </div>

            {/* Supported formats */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 10 }}>
                Supported formats
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {formats.map(f => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    border: "1px solid var(--line-1)",
                    borderRadius: "var(--r-2)",
                    background: "var(--bg-1)",
                  }}>
                    <span style={{ color: "var(--fg-2)" }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-0)" }}>{f.label}</div>
                      <div style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{f.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: recent imports */}
          <div style={{ width: 420, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "12px 16px 10px",
              borderBottom: "1px solid var(--line-1)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>Recent imports</span>
                <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>31</span>
              </div>
              <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 11 }}>{I.filter} Filter</button>
            </div>

            <div style={{ overflow: "auto", flex: 1 }}>
              {recentImports.map((imp) => (
                <div key={imp.id} style={{
                  padding: "11px 16px",
                  borderBottom: "1px solid var(--line-1)",
                  display: "flex", flexDirection: "column", gap: 5,
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: imp.status === "done" ? "var(--st-bypassed)" : "var(--st-blocked)",
                    }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--fg-0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imp.source}
                    </span>
                    <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{imp.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 }}>
                    <span style={{ fontSize: 11, color: "var(--fg-2)" }}>
                      <span className="tnum" style={{ fontFamily: "var(--font-mono)", color: imp.status === "error" ? "var(--st-blocked)" : "var(--fg-1)" }}>
                        {imp.status === "error" ? "parse error" : `${imp.prompts} prompts`}
                      </span>
                    </span>
                    <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>→</span>
                    <span style={{ fontSize: 11, color: "var(--fg-2)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imp.workspace}
                    </span>
                    <span className="tnum" style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: "auto" }}>{imp.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

Object.assign(window, { ImportScreen });
