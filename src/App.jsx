import { useState, useEffect } from "react";
import { useLang } from "./LangContext.jsx";
import { i18n } from "./i18n.js";

// ── Static data (ids + emojis only; labels come from i18n) ──
const VALUES = [
  { id: "money",      emoji: "💰" },
  { id: "learning",   emoji: "🧠" },
  { id: "autonomy",   emoji: "🎯" },
  { id: "impact",     emoji: "🌍" },
  { id: "growth",     emoji: "🚀" },
  { id: "people",     emoji: "🤝" },
  { id: "balance",    emoji: "🏡" },
  { id: "security",   emoji: "🔒" },
  { id: "prestige",   emoji: "🏆" },
  { id: "creativity", emoji: "💡" },
  { id: "leadership", emoji: "👑" },
  { id: "expertise",  emoji: "🔬" },
  { id: "challenge",  emoji: "🌱" },
  { id: "culture",    emoji: "🏢" },
];

const CAREER_TYPES_META = {
  autonomous: { emoji: "🎯", color: "#e8824a", traits: ["autonomy", "creativity", "challenge"] },
  achiever:   { emoji: "🏆", color: "#c9a84c", traits: ["growth", "prestige", "money"] },
  meaningful: { emoji: "🌍", color: "#5a9e6f", traits: ["impact", "culture", "people"] },
  expert:     { emoji: "🔬", color: "#6a8fcf", traits: ["expertise", "learning", "challenge"] },
  steady:     { emoji: "🏡", color: "#9b7ec8", traits: ["security", "balance", "money"] },
};

function detectTypeKey(ranked) {
  const top3ids = ranked.slice(0, 3).map((v) => v.id);
  let bestType = "expert";
  let bestScore = -1;
  for (const [key, type] of Object.entries(CAREER_TYPES_META)) {
    const score = type.traits.filter((t) => top3ids.includes(t)).length;
    if (score > bestScore) { bestScore = score; bestType = key; }
  }
  return bestType;
}

function generatePairs(values) {
  const n = values.length;
  const targetPairs = 35;
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

// ── Waitlist Modal ──
function WaitlistModal({ onClose }) {
  const { lang } = useLang();
  const t = i18n[lang].career.ui.waitlist;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbySZQS4qFXzj7zBLENpvjDy2dZWOZEJTGkxHsOjKSMGWKqdzspTyloC1pu9QivriFJXbg/exec";

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) { setError(t.emailError); return; }
    setError("");
    setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ name, email, message }),
      });
    } catch (_) {}
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#0f0e0c", borderRadius: 10,
    padding: "12px 14px", color: "#f0ead6", fontSize: 14,
    fontFamily: "'Noto Serif TC', serif", outline: "none",
  };
  const labelStyle = {
    fontSize: 12, color: "#9a9080", display: "block",
    marginBottom: 6, letterSpacing: "0.05em",
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div style={{
        background: "#1c1a16", border: "1px solid #3a3730", borderRadius: 24,
        padding: "36px 32px", width: "100%", maxWidth: 460, position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 18, background: "transparent",
          border: "none", color: "#7a7870", fontSize: 20, cursor: "pointer",
        }}>✕</button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 8 }}>
                {t.title}
              </h3>
              <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.8 }}>
                {t.body}<br />
                <span style={{ color: "#c9a84c" }}>{t.bodyGold}</span>
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>{t.nameLabel}</label>
                <input type="text" placeholder={t.namePlaceholder} value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, border: "1px solid #3a3730" }} />
              </div>
              <div>
                <label style={labelStyle}>{t.emailLabel} <span style={{ color: "#c9a84c" }}>{t.emailRequired}</span></label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  style={{ ...inputStyle, border: `1px solid ${error ? "#c0504d" : "#3a3730"}` }} />
                {error && <p style={{ fontSize: 12, color: "#c0504d", marginTop: 5 }}>{error}</p>}
              </div>
              <div>
                <label style={labelStyle}>{t.messageLabel}</label>
                <textarea placeholder={t.messagePlaceholder} value={message}
                  onChange={(e) => setMessage(e.target.value)} rows={3}
                  style={{ ...inputStyle, border: "1px solid #3a3730", resize: "none", lineHeight: 1.7 }} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", background: loading ? "#5a5040" : "linear-gradient(135deg,#c9a84c,#e8c96a)",
              color: loading ? "#9a9080" : "#0f0e0c", border: "none", padding: "14px", borderRadius: 40,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Noto Serif TC', serif", letterSpacing: "0.05em",
              transition: "background 0.2s, color 0.2s",
            }}>
              {loading ? t.submitting : t.submit}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#7a7870", marginTop: 12 }}>{t.disclaimer}</p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 12 }}>
              {t.successTitle}
            </h3>
            <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.9, marginBottom: 28 }}>
              {name ? name + (t.nameComma || "") : ""}
              {t.successBody}<br />{t.successFooter}
            </p>
            <button onClick={onClose} style={{
              background: "transparent", color: "#c9a84c", border: "1px solid #c9a84c",
              padding: "10px 28px", borderRadius: 40, fontSize: 14, cursor: "pointer",
              fontFamily: "'Noto Serif TC', serif",
            }}>
              {t.backToResult}
            </button>
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
            fontSize: 10,
            color: value === n ? color : "#9a9080",
            fontWeight: value === n ? 700 : 400,
            transition: "color 0.2s",
          }}>
            {labels[n - 1]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──
export default function CareerValuesQuiz() {
  const { lang } = useLang();
  const t = i18n[lang].career;
  const ui = t.ui;

  // Merge ids/emojis with translated labels
  const displayValues = VALUES.map((v) => ({ ...v, ...t.values[v.id] }));

  const [phase, setPhase] = useState(() => {
    const returnPhase = localStorage.getItem("motive_career_return");
    if (returnPhase) localStorage.removeItem("motive_career_return");
    return returnPhase || "intro";
  });
  const [pairs, setPairs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({});
  const [cardAnim, setCardAnim] = useState({ left: "", right: "" });
  const [animating, setAnimating] = useState(false);
  const [satisfaction, setSatisfaction] = useState({});
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    if (phase === "quiz") {
      setPairs(generatePairs(displayValues));
      const init = {};
      VALUES.forEach((v) => (init[v.id] = 0));
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
  const top5 = ranked.slice(0, 5);
  const careerTypeKey = phase === "result" ? detectTypeKey(ranked) : null;
  const careerType = careerTypeKey
    ? { ...CAREER_TYPES_META[careerTypeKey], ...t.careerTypes[careerTypeKey] }
    : null;
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
        .career-card { background:#1c1a16; border:1px solid #2a2720; border-radius:14px; padding:18px 20px; margin-bottom:10px; display:flex; gap:14px; align-items:flex-start; }
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
            <div style={{ fontSize: 48, marginBottom: 24 }}>🧭</div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(32px,6vw,52px)", lineHeight: 1.2, marginBottom: 16 }}>
              {ui.intro.title[0]}<br />{ui.intro.title[1]}
            </h1>
            <p style={{ color: "#9a9080", fontSize: 15, lineHeight: 1.9, maxWidth: 380, margin: "0 auto 10px" }}>
              {ui.intro.subtitle}
            </p>
            <p style={{ color: "#7a7870", fontSize: 13, marginBottom: 48 }}>{ui.intro.meta}</p>
            <button className="btn-primary" onClick={() => setPhase("quiz")}>{ui.intro.start}</button>
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
              <button className="btn-primary" onClick={() => {
                const r = computeRanking(displayValues, scores);
                localStorage.setItem("motive_career_ranked", JSON.stringify(r.map(v => v.id)));
                setPhase("result");
              }}>{ui.seeResults}</button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && careerType && (
          <div>
            <StepDots phase="result" stepLabels={t.stepLabels} />

            {/* Type */}
            <div className="fade-up" style={{
              borderRadius: 20, padding: "28px 24px", marginBottom: 24,
              background: "linear-gradient(135deg," + careerType.color + "22,#1c1a16)",
              border: "1px solid " + careerType.color + "55",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: careerType.color, textTransform: "uppercase", marginBottom: 10 }}>{ui.result.typeLabel}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 42 }}>{careerType.emoji}</span>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(24px,4vw,36px)", color: "#f0ead6" }}>{careerType.label}</h2>
              </div>
            </div>

            {/* Insight */}
            <div className="insight-box fade-up" style={{ animationDelay: "0.1s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 10, textTransform: "uppercase" }}>{ui.result.coreLabel}</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "#b8b0a0" }}>{careerType.insight}</p>
            </div>

            <div className="insight-box fade-up" style={{ animationDelay: "0.2s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 10, textTransform: "uppercase" }}>{ui.result.tensionLabel}</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "#b8b0a0" }}>{careerType.tension}</p>
            </div>

            {/* Satisfaction Gap */}
            <div className="insight-box fade-up" style={{ animationDelay: "0.3s" }}>
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

            {/* Career Recommendations */}
            <div className="fade-up" style={{ animationDelay: "0.4s", marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 16, textTransform: "uppercase" }}>{ui.result.careersLabel}</div>
              {careerType.careers.map((c, i) => (
                <div key={i} className="career-card">
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "#2a2720",
                    border: "1px solid #3a3730", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, fontSize: 12, color: "#c9a84c",
                    fontFamily: "'DM Serif Display',serif",
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 15, color: "#f0ead6", fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: "#9a9080", lineHeight: 1.6 }}>{c.reason}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Life design upsell */}
            <div className="fade-up" style={{ animationDelay: "0.45s", marginBottom: 28 }}>
              <div style={{
                background: "linear-gradient(135deg,#1c1a10,#1c1a16)",
                border: "1px solid #c9a84c44", borderRadius: 20,
                padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,rgba(201,168,76,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 14 }}>{ui.result.nextStepLabel}</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#f0ead6", marginBottom: 12, lineHeight: 1.4 }}>
                  {ui.result.nextStepTitle}
                </div>
                <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.9, maxWidth: 300, margin: "0 auto 24px" }}>
                  {ui.result.nextStepBody[0]}<br />{ui.result.nextStepBody[1]}
                </p>
                <a
                  href="#life"
                  onClick={() => localStorage.setItem("motive_career_return", "result")}
                  style={{
                    background: "linear-gradient(135deg,#c9a84c,#e8c96a)", color: "#0f0e0c",
                    border: "none", padding: "14px 32px", borderRadius: 40,
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Noto Serif TC',serif", letterSpacing: "0.05em",
                    textDecoration: "none", display: "inline-block",
                  }}
                >
                  {ui.result.nextStepCta}
                </a>
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
              <button className="btn-ghost" onClick={() => setPhase("satisfaction")}>{ui.reAssess}</button>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>{ui.retake}</button>
            </div>
          </div>
        )}

        <LanguageSwitcher />
      </div>

      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </div>
  );
}
