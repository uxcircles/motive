import { useState, useEffect } from "react";
import { useLang } from "./LangContext.jsx";
import { i18n } from "./i18n.js";

// ── Static data (ids + emojis only; labels come from i18n) ──
const LIFE_VALUES = [
  { id: "impact",     emoji: "🌏" }, // 12 o'clock
  { id: "career",     emoji: "💼" }, // 01
  { id: "finance",    emoji: "💰" }, // 02
  { id: "family",     emoji: "🏡" }, // 03
  { id: "romance",    emoji: "💕" }, // 04
  { id: "friendship", emoji: "🤝" }, // 05
  { id: "peace",      emoji: "🌙" }, // 06
  { id: "health",     emoji: "💪" }, // 07
  { id: "autonomy",   emoji: "🗝️" }, // 08
  { id: "experience", emoji: "✈️" }, // 09
  { id: "growth",     emoji: "🌱" }, // 10
  { id: "creativity", emoji: "🎨" }, // 11
];

function generatePairs(values) {
  const n = values.length;
  const targetPairs = 36;
  const minAppearances = 4;

  const allPairs = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) allPairs.push([i, j]);

  for (let i = allPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
  }

  const selected = [];
  const appearances = new Array(n).fill(0);

  for (const pair of allPairs) {
    if (selected.length >= targetPairs) break;
    const [a, b] = pair;
    if (appearances[a] < minAppearances || appearances[b] < minAppearances) {
      selected.push(pair);
      appearances[a]++;
      appearances[b]++;
    }
  }

  for (const pair of allPairs) {
    if (selected.length >= targetPairs) break;
    if (!selected.includes(pair)) {
      selected.push(pair);
      appearances[pair[0]]++;
      appearances[pair[1]]++;
    }
  }

  return selected;
}

function computeRanking(displayValues, scores) {
  return [...displayValues]
    .map((v) => ({ ...v, score: scores[v.id] || 0 }))
    .sort((a, b) => b.score - a.score);
}

function satisfactionColor(val) {
  return ["#c0504d", "#d97c45", "#c9a84c", "#7aab6e", "#4e9a7a"][val - 1];
}

// ── Language Switcher ──
function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const btnStyle = (active) => ({
    background: "none", border: "none",
    color: active ? "#c9a84c" : "#7a7870",
    fontSize: 11, cursor: active ? "default" : "pointer",
    fontFamily: "'Noto Serif TC', serif", letterSpacing: "0.08em",
    padding: "4px 8px", transition: "color 0.2s",
  });
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      textAlign: "center", padding: "10px 0 12px",
      background: "linear-gradient(to top, #0f0e0c 60%, transparent)",
      pointerEvents: "none",
    }}>
      <div style={{ pointerEvents: "auto", display: "inline-flex", alignItems: "center" }}>
        <button style={btnStyle(lang === "zh")} onClick={() => setLang("zh")} disabled={lang === "zh"}>繁中</button>
        <span style={{ color: "#2a2720", fontSize: 10 }}>·</span>
        <button style={btnStyle(lang === "en")} onClick={() => setLang("en")} disabled={lang === "en"}>English</button>
      </div>
    </div>
  );
}

// ── Radar Chart ──
function RadarChart({ ranked }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 98;
  const n = ranked.length;
  const maxScore = Math.max(...ranked.map(d => d.score), 1);

  const getPoint = (i, ratio) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  };

  const getLabelPoint = (i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    return { x: cx + (r + 34) * Math.cos(angle), y: cy + (r + 34) * Math.sin(angle) };
  };

  const gridPolygons = [0.25, 0.5, 0.75, 1].map(level => {
    const pts = ranked.map((_, i) => { const p = getPoint(i, level); return `${p.x},${p.y}`; }).join(" ");
    return <polygon key={level} points={pts} fill="none" stroke="#2a2720" strokeWidth={1} />;
  });

  const axisLines = ranked.map((_, i) => {
    const end = getPoint(i, 1);
    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#2a2720" strokeWidth={1} />;
  });

  const scorePoints = ranked.map((d, i) => {
    const ratio = d.score / maxScore;
    const p = getPoint(i, ratio);
    return `${p.x},${p.y}`;
  }).join(" ");

  const dots = ranked.map((d, i) => {
    const ratio = d.score / maxScore;
    const p = getPoint(i, ratio);
    return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#c9a84c" />;
  });

  const labels = ranked.map((d, i) => {
    const p = getLabelPoint(i);
    return (
      <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={10} fill="#9a9080" fontFamily="'Noto Serif TC', serif">
        {d.emoji} {d.label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {gridPolygons}
      {axisLines}
      <polygon points={scorePoints} fill="rgba(201,168,76,0.12)" stroke="#c9a84c" strokeWidth={2.5} strokeLinejoin="round" />
      {dots}
      {labels}
    </svg>
  );
}

// ── Conflict Analysis ──
function ConflictAnalysis({ lifeRanked, tConflict, careerLabels }) {
  let careerRanked = null;
  try { careerRanked = JSON.parse(localStorage.getItem("motive_career_ranked") || "null"); } catch (_) {}

  if (!careerRanked || careerRanked.length === 0) return null;

  const careerTop3 = careerRanked.slice(0, 3);
  const careerRankInLife = lifeRanked.findIndex(v => v.id === "career") + 1;

  const careerToLife = {
    money: "finance", learning: "growth", autonomy: "autonomy",
    impact: "impact", growth: "growth", people: "friendship",
    balance: "autonomy", security: "finance", prestige: "career",
    creativity: "creativity", leadership: "impact", expertise: "growth",
    challenge: "experience", culture: "friendship",
  };

  const lifeTop3Ids = lifeRanked.slice(0, 3).map(v => v.id);
  const hasConflict = careerTop3.some(cv => {
    const lifeEquiv = careerToLife[cv];
    return lifeEquiv && !lifeTop3Ids.includes(lifeEquiv);
  });

  const rankMsg = careerRankInLife <= 3
    ? tConflict.rankHigh
    : careerRankInLife <= 7
      ? tConflict.rankMid
      : tConflict.rankLow;

  return (
    <div className="insight-box fade-up" style={{ animationDelay: "0.4s" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 14, textTransform: "uppercase" }}>
        {tConflict.sectionLabel}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9a9080", marginBottom: 6 }}>{tConflict.careerRankLabel}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: careerRankInLife <= 3 ? "#c9a84c" : careerRankInLife <= 7 ? "#f0ead6" : "#9a9080" }}>
          {tConflict.formatRank(careerRankInLife)}
        </div>
        <div style={{ fontSize: 13, color: "#b8b0a0", marginTop: 4, lineHeight: 1.8 }}>{rankMsg}</div>
      </div>

      <div style={{ height: 1, background: "#2a2720", margin: "14px 0" }} />

      <div style={{ fontSize: 12, color: "#9a9080", marginBottom: 8 }}>{tConflict.topCareerLabel}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {careerTop3.map(v => {
          const info = careerLabels[v] || { label: v, emoji: "•" };
          return (
            <span key={v} style={{
              fontSize: 12, padding: "4px 12px", borderRadius: 20,
              background: "#2a2720", color: "#c9a84c", border: "1px solid #c9a84c44",
            }}>
              {info.emoji} {info.label}
            </span>
          );
        })}
      </div>

      <div style={{ fontSize: 13, color: "#b8b0a0", lineHeight: 1.9 }}>
        {hasConflict ? tConflict.conflictMsg : tConflict.alignMsg}
      </div>
    </div>
  );
}

// ── Satisfaction Slider ──
function SatisfactionSlider({ value, onChange, color, labels }) {
  return (
    <div>
      <input type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", marginBottom: 6 }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{
            fontSize: 10, color: value === n ? color : "#9a9080",
            fontWeight: value === n ? 700 : 400, transition: "color 0.2s",
          }}>{labels[n - 1]}</span>
        ))}
      </div>
    </div>
  );
}

// ── Life Waitlist Modal ──
function LifeWaitlistModal({ onClose, top3, tWaitlist }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbySZQS4qFXzj7zBLENpvjDy2dZWOZEJTGkxHsOjKSMGWKqdzspTyloC1pu9QivriFJXbg/exec";

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) { setError(tWaitlist.emailError); return; }
    setError(""); setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ name, email, quiz_type: "life", top3: top3.join(","), price_willingness: price }),
      });
    } catch (_) {}
    setLoading(false); setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#0f0e0c", borderRadius: 10,
    padding: "12px 14px", color: "#f0ead6", fontSize: 14,
    fontFamily: "'Noto Serif TC', serif", outline: "none",
  };
  const labelStyle = { fontSize: 12, color: "#9a9080", display: "block", marginBottom: 6, letterSpacing: "0.05em" };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#1c1a16", border: "1px solid #3a3730", borderRadius: 24,
        padding: "36px 32px", width: "100%", maxWidth: 460, position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "transparent", border: "none", color: "#7a7870", fontSize: 20, cursor: "pointer" }}>✕</button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 8 }}>{tWaitlist.title}</h3>
              <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.8 }}>
                <span style={{ color: "#c9a84c" }}>{tWaitlist.bodyGold}</span>
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>{tWaitlist.nameLabel}</label>
                <input type="text" placeholder={tWaitlist.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, border: "1px solid #3a3730" }} />
              </div>
              <div>
                <label style={labelStyle}>{tWaitlist.emailLabel} <span style={{ color: "#c9a84c" }}>{tWaitlist.emailRequired}</span></label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  style={{ ...inputStyle, border: `1px solid ${error ? "#c0504d" : "#3a3730"}` }} />
                {error && <p style={{ fontSize: 12, color: "#c0504d", marginTop: 5 }}>{error}</p>}
              </div>
              <div>
                <label style={labelStyle}>{tWaitlist.priceLabel}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                  {tWaitlist.priceOptions.map(opt => (
                    <button key={opt.value} onClick={() => setPrice(opt.value)} type="button" style={{
                      padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                      fontFamily: "'Noto Serif TC', serif", transition: "all 0.15s",
                      background: price === opt.value ? "rgba(201,168,76,0.15)" : "transparent",
                      border: `1px solid ${price === opt.value ? "#c9a84c" : "#3a3730"}`,
                      color: price === opt.value ? "#c9a84c" : "#9a9080",
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", background: loading ? "#5a5040" : "linear-gradient(135deg,#c9a84c,#e8c96a)",
              color: loading ? "#9a9080" : "#0f0e0c", border: "none", padding: "14px", borderRadius: 40,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Noto Serif TC', serif", letterSpacing: "0.05em", transition: "background 0.2s, color 0.2s",
            }}>
              {loading ? tWaitlist.submitting : tWaitlist.submit}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#7a7870", marginTop: 12 }}>{tWaitlist.disclaimer}</p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 12 }}>{tWaitlist.successTitle}</h3>
            <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.8 }}>
              {tWaitlist.successBody}<br />{tWaitlist.successFooter}
            </p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: 24 }}>{tWaitlist.close}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step Dots ──
function StepDots({ phase, stepLabels }) {
  const steps = ["intro", "quiz", "satisfaction", "result"];
  const active = steps.indexOf(phase);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: active >= i ? "linear-gradient(135deg,#c9a84c,#e8c96a)" : "#1c1a16",
            border: `1px solid ${active >= i ? "#c9a84c" : "#3a3730"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: active >= i ? "#0f0e0c" : "#7a7870", fontWeight: 700,
            transition: "all 0.3s",
          }}>
            {active > i ? "✓" : i}
          </div>
          <div style={{ fontSize: 10, color: active >= i ? "#c9a84c" : "#9a9080", marginLeft: 5, marginRight: 12 }}>
            {stepLabels[i]}
          </div>
          {i < 3 && (
            <div style={{
              width: 20, height: 1,
              background: active > i ? "#c9a84c" : "#2a2720",
              marginRight: 5, transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main ──
export default function LifeQuiz({ onBack }) {
  const { lang } = useLang();
  const t = i18n[lang].life;
  const ui = t.ui;

  // Merge ids/emojis with translated labels
  const displayValues = LIFE_VALUES.map((v) => ({ ...v, ...t.lifeValues[v.id] }));

  const [phase, setPhase] = useState("intro");
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [pairs, setPairs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({});
  const [cardAnim, setCardAnim] = useState({ left: "", right: "" });
  const [animating, setAnimating] = useState(false);
  const [satisfaction, setSatisfaction] = useState({});

  useEffect(() => {
    if (phase === "quiz") {
      setPairs(generatePairs(displayValues));
      const init = {};
      LIFE_VALUES.forEach((v) => (init[v.id] = 0));
      setScores(init);
      setCurrent(0);
      setCardAnim({ left: "", right: "" });
      setAnimating(false);
    }
    if (phase === "satisfaction") {
      const init = {};
      computeRanking(displayValues, scores).slice(0, 5).forEach((v) => (init[v.id] = 3));
      setSatisfaction(init);
    }
    window.scrollTo(0, 0);
  }, [phase]);

  const handleChoose = (side) => {
    if (animating) return;
    const [li, ri] = pairs[current];
    const winner = side === "left" ? displayValues[li].id : displayValues[ri].id;
    setCardAnim({ left: side === "left" ? "winner" : "loser", right: side === "right" ? "winner" : "loser" });
    setAnimating(true);
    setScores((prev) => ({ ...prev, [winner]: (prev[winner] || 0) + 1 }));
    setTimeout(() => {
      if (current + 1 >= pairs.length) {
        setPhase("satisfaction");
      } else {
        setCurrent((c) => c + 1);
        setCardAnim({ left: "", right: "" });
        setAnimating(false);
      }
    }, 550);
  };

  const ranked = ["satisfaction", "result"].includes(phase) ? computeRanking(displayValues, scores) : [];
  const radarData = displayValues.map(v => ({ ...v, score: scores[v.id] || 0 }));
  const top5 = ranked.slice(0, 5);
  const progress = pairs.length > 0 ? Math.round((current / pairs.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Noto Serif TC', Georgia, serif", minHeight: "100vh", background: "#0f0e0c", color: "#f0ead6" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background:#1c1a16; border:1px solid #3a3730; border-radius:20px; padding:32px 24px; cursor:pointer; transition:transform 0.15s,border-color 0.15s,box-shadow 0.15s,background 0.15s; position:relative; overflow:hidden; width:100%; max-width:255px; min-height:210px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; user-select:none; }
        @media (hover: hover) { .card:hover { border-color:#c9a84c; box-shadow:0 0 28px rgba(201,168,76,0.15); transform:translateY(-4px); background:rgba(201,168,76,0.1); } }
        .card.winner { border-color:#c9a84c; box-shadow:0 0 48px rgba(201,168,76,0.3); transform:scale(1.05); background:rgba(201,168,76,0.1); animation:winPulse 0.5s ease; }
        .card.loser { opacity:0.3; transform:scale(0.94); filter:grayscale(0.7); }
        @keyframes winPulse { 0%{box-shadow:0 0 0 rgba(201,168,76,0)} 50%{box-shadow:0 0 56px rgba(201,168,76,0.5)} 100%{box-shadow:0 0 48px rgba(201,168,76,0.3)} }
        .progress-bar { height:3px; background:#2a2720; border-radius:2px; overflow:hidden; flex:1; }
        .progress-fill { height:100%; background:linear-gradient(90deg,#c9a84c,#e8c96a); border-radius:2px; transition:width 0.4s; }
        .rank-item { display:flex; align-items:center; gap:14px; padding:12px 18px; background:#1c1a16; border:1px solid #2a2720; border-radius:12px; }
        .rank-num { font-family:'DM Serif Display',serif; font-size:20px; color:#7a7870; width:26px; text-align:center; flex-shrink:0; }
        .rank-num.top { color:#c9a84c; }
        .score-bar-wrap { flex:1; height:4px; background:#2a2720; border-radius:2px; overflow:hidden; }
        .score-bar { height:100%; background:linear-gradient(90deg,#c9a84c,#e8c96a); border-radius:2px; }
        .btn-primary { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0f0e0c; border:none; padding:14px 36px; border-radius:40px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Noto Serif TC',serif; letter-spacing:0.05em; transition:opacity 0.2s,transform 0.1s; }
        .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
        .btn-ghost { background:transparent; color:#9a9080; border:1px solid #9a9080; padding:10px 24px; border-radius:40px; font-size:14px; cursor:pointer; font-family:'Noto Serif TC',serif; transition:border-color 0.2s,color 0.2s,transform 0.1s; }
        .btn-ghost:hover { border-color:#f0ead6; color:#f0ead6; transform:translateY(-1px); }
        .sat-card { background:#1c1a16; border:1px solid #2a2720; border-radius:16px; padding:22px 24px; margin-bottom:12px; }
        .insight-box { background:transparent; border:none; border-left:2px solid #c9a84c44; padding:4px 0 4px 20px; margin-bottom:28px; position:relative; }
        .insight-box::before { content:''; }
        .divider { height:1px; background:linear-gradient(90deg,transparent,#2a2720,transparent); margin:28px 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.45s ease forwards; }
        .grain { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:200px; }
      `}</style>

      <div className="grain" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>

        {/* INTRO */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#c9a84c", marginBottom: 20, textTransform: "uppercase" }}>{ui.brand}</div>
            <div style={{ fontSize: 48, marginBottom: 24 }}>🗺️</div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.2, marginBottom: 16 }}>
              {ui.intro.title[0]}<br />{ui.intro.title[1]}
            </h1>
            <p style={{ color: "#9a9080", fontSize: 15, lineHeight: 1.9, maxWidth: 380, margin: "0 auto 10px" }}>
              {ui.intro.subtitle}
            </p>
            <p style={{ color: "#7a7870", fontSize: 13, marginBottom: 48 }}>{ui.intro.meta}</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>{ui.intro.start}</button>
              {onBack && (
                <button onClick={onBack}
                  onMouseEnter={e => { e.currentTarget.style.color = "#b8b0a0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#9a9080"; e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: "none", border: "none", color: "#9a9080", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Serif TC',serif", marginTop: 12, transition: "color 0.2s,transform 0.1s" }}>
                  {ui.backToCareer}
                </button>
              )}
            </div>
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && pairs.length > 0 && current < pairs.length && (
          <div>
            <StepDots phase="quiz" stepLabels={t.stepLabels} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12 }}>
              <span style={{ color: "#9a9080", fontSize: 12, flexShrink: 0 }}>{current + 1} / {pairs.length}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <span style={{ color: "#9a9080", fontSize: 12, flexShrink: 0 }}>{progress}%</span>
            </div>
            <p style={{ textAlign: "center", color: "#9a9080", fontSize: 14, marginBottom: 28, letterSpacing: "0.08em" }}>
              {ui.quizPrompt}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {[0, 1].map((side) => {
                const v = displayValues[pairs[current][side]];
                const anim = side === 0 ? cardAnim.left : cardAnim.right;
                return (
                  <div key={v.id} className={"card " + anim} onClick={() => handleChoose(side === 0 ? "left" : "right")}>
                    <div style={{ fontSize: 42 }}>{v.emoji}</div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#f0ead6", textAlign: "center" }}>{v.label}</div>
                    <div style={{ fontSize: 12, color: "#9a9080", textAlign: "center", lineHeight: 1.6 }}>{v.desc}</div>
                    {anim === "winner" && <div style={{ position: "absolute", top: 12, right: 14, fontSize: 16, color: "#c9a84c" }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button className="btn-ghost" onClick={() => setPhase("intro")}>{ui.restart}</button>
            </div>
          </div>
        )}

        {/* SATISFACTION */}
        {phase === "satisfaction" && (
          <div>
            <StepDots phase="satisfaction" stepLabels={t.stepLabels} />
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🪞</div>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(22px,4vw,34px)", marginBottom: 10 }}>{ui.satisfaction.title}</h2>
              <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
                {ui.satisfaction.subtitle[0]}<br />{ui.satisfaction.subtitle[1]}
              </p>
            </div>
            <div style={{ marginBottom: 32 }}>
              {top5.map((v, i) => (
                <div key={v.id} className="sat-card fade-up" style={{ animationDelay: i * 0.08 + "s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, color: "#f0ead6", fontWeight: 600 }}>{v.label}</div>
                      <div style={{ fontSize: 12, color: "#9a9080" }}>{v.desc}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 20 }}>
                      {["😞", "😕", "😐", "🙂", "😊"][(satisfaction[v.id] || 3) - 1]}
                    </div>
                  </div>
                  <SatisfactionSlider
                    value={satisfaction[v.id] || 3}
                    onChange={(val) => setSatisfaction((prev) => ({ ...prev, [v.id]: val }))}
                    color={satisfactionColor(satisfaction[v.id] || 3)}
                    labels={t.satisfactionLabels}
                  />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setPhase("quiz")}>{ui.reCompare}</button>
              <button className="btn-primary" onClick={() => setPhase("result")}>{ui.seeResults}</button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <div>
            <StepDots phase="result" stepLabels={t.stepLabels} />

            {/* Radar Chart */}
            <div className="fade-up" style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 20 }}>{ui.result.radarLabel}</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <RadarChart ranked={radarData} />
              </div>
            </div>

            {/* Top 5 */}
            <div className="fade-up" style={{ animationDelay: "0.1s", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 12, textTransform: "uppercase" }}>{ui.result.topLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {top5.map((v, i) => {
                  const pct = Math.round((v.score / (ranked[0].score || 1)) * 100);
                  return (
                    <div key={v.id} className="rank-item">
                      <span className={"rank-num" + (i < 3 ? " top" : "")}>{i + 1}</span>
                      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{v.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#f0ead6", marginBottom: 5 }}>{v.label}</div>
                        <div className="score-bar-wrap"><div className="score-bar" style={{ width: pct + "%" }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Satisfaction Gap */}
            <div className="insight-box fade-up" style={{ animationDelay: "0.2s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 14, textTransform: "uppercase" }}>{ui.result.gapLabel}</div>
              {top5.map((v) => {
                const sat = satisfaction[v.id] || 3;
                const gap = sat <= 2;
                return (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 18, width: 24 }}>{v.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: gap ? "#c9a84c" : "#f0ead6" }}>{v.label}</span>
                        <span style={{ fontSize: 12, color: satisfactionColor(sat) }}>
                          {t.satisfactionLabels[sat - 1]}
                        </span>
                      </div>
                      <div style={{ height: 4, background: "#2a2720", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: sat * 20 + "%", background: satisfactionColor(sat), borderRadius: 2, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                    {gap && <div style={{ fontSize: 11, color: "#c9a84c", flexShrink: 0 }}>⚠️</div>}
                  </div>
                );
              })}
              <p style={{ fontSize: 13, color: "#9a9080", marginTop: 14, lineHeight: 1.7, borderTop: "1px solid #2a2720", paddingTop: 14 }}>
                {top5.filter((v) => (satisfaction[v.id] || 3) <= 2).length > 0
                  ? ui.result.gapNegative
                  : ui.result.gapPositive}
              </p>
            </div>

            {/* Conflict Analysis */}
            <ConflictAnalysis
              lifeRanked={ranked}
              tConflict={ui.conflict}
              careerLabels={t.careerLabels}
            />

            {/* Paid CTA */}
            <div className="fade-up" style={{ animationDelay: "0.5s", marginBottom: 28 }}>
              <div style={{
                background: "linear-gradient(135deg,#1c1a10,#1c1a16)",
                border: "1px solid #c9a84c44", borderRadius: 20,
                padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,rgba(201,168,76,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 14 }}>{ui.result.ctaLabel}</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#f0ead6", marginBottom: 12 }}>
                  {ui.result.ctaTitle}
                </div>
                <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.9, maxWidth: 340, margin: "0 auto 24px" }}>
                  {ui.result.ctaBody[0]}<br />{ui.result.ctaBody[1]}
                </p>
                <button
                  onClick={() => setShowWaitlist(true)}
                  style={{
                    background: "linear-gradient(135deg,#c9a84c,#e8c96a)", color: "#0f0e0c",
                    border: "none", padding: "14px 32px", borderRadius: 40,
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Noto Serif TC',serif", letterSpacing: "0.05em",
                  }}
                >
                  {ui.result.ctaCta}
                </button>
              </div>
            </div>

            {/* Full ranking */}
            <div className="divider" />
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#9a9080", textTransform: "uppercase", marginBottom: 10 }}>{ui.result.rankingLabel}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 36 }}>
              {ranked.map((v, i) => {
                const pct = Math.round((v.score / (ranked[0].score || 1)) * 100);
                return (
                  <div key={v.id} className="rank-item">
                    <span className={"rank-num" + (i < 3 ? " top" : "")}>{i + 1}</span>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{v.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#f0ead6", marginBottom: 5 }}>{v.label}</div>
                      <div className="score-bar-wrap"><div className="score-bar" style={{ width: pct + "%" }} /></div>
                    </div>
                    <span style={{ fontSize: 11, color: "#9a9080", width: 36, textAlign: "right" }}>{v.score}{ui.result.ptsUnit}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {onBack && <button className="btn-ghost" onClick={onBack}>{ui.careerQuizBtn}</button>}
              <button className="btn-ghost" onClick={() => setPhase("satisfaction")}>{ui.reAssess}</button>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>{ui.retake}</button>
            </div>
          </div>
        )}

        <LanguageSwitcher />
      </div>

      {showWaitlist && (
        <LifeWaitlistModal
          onClose={() => setShowWaitlist(false)}
          top3={ranked.slice(0, 3).map(v => v.label)}
          tWaitlist={ui.waitlist}
        />
      )}
    </div>
  );
}
