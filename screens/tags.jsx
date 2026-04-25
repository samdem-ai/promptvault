/* global React, Sidebar, I, TAG_COLORS, PROMPTS */

const TagsScreen = () => {
  const selectedTag = "extraction";

  const tags = [
    { name: "extraction",    count: 22, blocked: 14, partial: 5, bypassed: 3, color: TAG_COLORS["extraction"] },
    { name: "indirect",      count: 18, blocked: 10, partial: 5, bypassed: 3, color: TAG_COLORS["indirect"] },
    { name: "encoding",      count: 15, blocked: 9,  partial: 4, bypassed: 2, color: TAG_COLORS["encoding"] },
    { name: "multi-turn",    count: 14, blocked: 8,  partial: 4, bypassed: 2, color: TAG_COLORS["multi-turn"] },
    { name: "persona",       count: 12, blocked: 10, partial: 1, bypassed: 1, color: TAG_COLORS["persona"] },
    { name: "tool-use",      count: 11, blocked: 7,  partial: 2, bypassed: 2, color: TAG_COLORS["tool-use"] },
    { name: "translation",   count: 9,  blocked: 5,  partial: 3, bypassed: 1, color: TAG_COLORS["translation"] },
    { name: "DAN-family",    count: 8,  blocked: 7,  partial: 1, bypassed: 0, color: TAG_COLORS["DAN-family"] },
    { name: "context",       count: 7,  blocked: 5,  partial: 1, bypassed: 1, color: TAG_COLORS["context"] },
    { name: "fenced",        count: 6,  blocked: 4,  partial: 1, bypassed: 1, color: TAG_COLORS["fenced"] },
    { name: "multimodal",    count: 5,  blocked: 3,  partial: 2, bypassed: 0, color: TAG_COLORS["multimodal"] },
    { name: "document",      count: 4,  blocked: 2,  partial: 1, bypassed: 1, color: TAG_COLORS["document"] },
    { name: "json",          count: 3,  blocked: 2,  partial: 1, bypassed: 0, color: TAG_COLORS["json"] },
    { name: "low-resource",  count: 2,  blocked: 1,  partial: 1, bypassed: 0, color: TAG_COLORS["low-resource"] },
  ];

  const selected = tags.find(t => t.name === selectedTag);
  const taggedPrompts = PROMPTS.filter(p => p.tags.includes(selectedTag));

  const MiniBar = ({ blocked, partial, bypassed, total }) => (
    <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", background: "var(--bg-3)", width: 80, flexShrink: 0 }}>
      <div style={{ width: `${blocked / total * 100}%`, background: "var(--st-blocked)" }} />
      <div style={{ width: `${partial / total * 100}%`, background: "var(--st-partial)" }} />
      <div style={{ width: `${bypassed / total * 100}%`, background: "var(--st-bypassed)" }} />
    </div>
  );

  return (
    <div className="screen">
      <Sidebar active="tags" />

      {/* Center: tag list */}
      <section style={{
        width: 420, flexShrink: 0,
        borderRight: "1px solid var(--line-1)",
        display: "flex", flexDirection: "column",
      }}>
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 14px", gap: 10,
        }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Tags</span>
          <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{tags.length}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11.5 }}>{I.sliders} Sort: count</button>
            <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11.5 }}>{I.plus} New tag</button>
          </div>
        </header>

        {/* Search */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-1)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px",
            background: "var(--bg-1)",
            border: "1px solid var(--line-1)",
            borderRadius: "var(--r-2)",
            fontSize: 12, color: "var(--fg-2)",
          }}>
            <span style={{ color: "var(--fg-3)" }}>{I.search}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-3)" }}>Filter tags…</span>
          </div>
        </div>

        {/* Tag rows */}
        <div style={{ overflow: "auto", flex: 1 }}>
          {tags.map(tag => {
            const isSelected = tag.name === selectedTag;
            return (
              <div key={tag.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                borderBottom: "1px solid var(--line-1)",
                background: isSelected ? "var(--bg-2)" : "transparent",
                borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
              }}>
                <span className="dot" style={{ background: tag.color, width: 8, height: 8, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: isSelected ? "var(--fg-0)" : "var(--fg-1)",
                  flex: 1,
                }}>{tag.name}</span>

                <MiniBar blocked={tag.blocked} partial={tag.partial} bypassed={tag.bypassed} total={tag.count} />

                <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)", minWidth: 20, textAlign: "right" }}>
                  {tag.count}
                </span>
                <span style={{ color: "var(--fg-3)" }}>{I.chevR}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: selected tag detail */}
      <aside style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{
          height: 44, flexShrink: 0,
          borderBottom: "1px solid var(--line-1)",
          display: "flex", alignItems: "center",
          padding: "0 18px", gap: 10,
        }}>
          <span className="dot" style={{ background: selected.color, width: 8, height: 8 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500 }}>{selected.name}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.edit}</button>
            <button className="btn btn-ghost" style={{ padding: 5 }}>{I.x}</button>
          </div>
        </header>

        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid var(--line-1)", borderRadius: "var(--r-3)", overflow: "hidden",
          }}>
            {[
              { label: "Prompts",  value: selected.count, sub: "tagged" },
              { label: "Bypassed", value: selected.bypassed, sub: `${Math.round(selected.bypassed / selected.count * 100)}%`, color: "var(--st-bypassed)" },
              { label: "Partial",  value: selected.partial,  sub: `${Math.round(selected.partial / selected.count * 100)}%`,  color: "var(--st-partial)" },
              { label: "Blocked",  value: selected.blocked,  sub: `${Math.round(selected.blocked / selected.count * 100)}%`,  color: "var(--st-blocked)" },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "14px 18px",
                borderLeft: i === 0 ? "none" : "1px solid var(--line-1)",
              }}>
                <div style={{ fontSize: 11, color: "var(--fg-2)", fontWeight: 500 }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  {s.color && <span className="dot" style={{ background: s.color, width: 7, height: 7 }} />}
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>{s.value}</div>
                </div>
                <div className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Coverage bar */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)" }}>
                Coverage
              </span>
              <span style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
                {selected.bypassed + selected.partial + selected.blocked} / {selected.count} tested
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, overflow: "hidden", background: "var(--bg-3)", display: "flex" }}>
              <div style={{ width: `${selected.blocked / selected.count * 100}%`, background: "var(--st-blocked)" }} />
              <div style={{ width: `${selected.partial / selected.count * 100}%`, background: "var(--st-partial)" }} />
              <div style={{ width: `${selected.bypassed / selected.count * 100}%`, background: "var(--st-bypassed)" }} />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-3)" }}>
              {[
                { label: "blocked",  c: "var(--st-blocked)",  v: selected.blocked },
                { label: "partial",  c: "var(--st-partial)",  v: selected.partial },
                { label: "bypassed", c: "var(--st-bypassed)", v: selected.bypassed },
              ].map(s => (
                <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="dot" style={{ background: s.c }} />
                  <span className="tnum" style={{ fontFamily: "var(--font-mono)" }}>{s.v}</span>
                  <span>{s.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Co-occurring tags */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 10 }}>
              Often co-tagged with
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["multi-turn", "encoding", "indirect", "context"].map(t => (
                <span key={t} className="tag" style={{ cursor: "pointer" }}>
                  <span className="dot" style={{ background: TAG_COLORS[t] || "var(--fg-3)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Prompts with this tag */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)" }}>
                Prompts
              </span>
              <span className="tnum" style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{taggedPrompts.length} shown</span>
            </div>
            <div style={{ border: "1px solid var(--line-1)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
              {taggedPrompts.map((p, i) => {
                const stColor = { bypassed: "var(--st-bypassed)", partial: "var(--st-partial)", blocked: "var(--st-blocked)", untested: "var(--st-untested)" }[p.status];
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    borderTop: i === 0 ? "none" : "1px solid var(--line-1)",
                    cursor: "pointer",
                  }}>
                    <span className="dot" style={{ background: stColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", flexShrink: 0 }}>{p.id}</span>
                    <span style={{ fontSize: 12.5, color: "var(--fg-0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{p.updated}</span>
                    <span style={{ color: "var(--fg-3)" }}>{I.chevR}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

Object.assign(window, { TagsScreen });
