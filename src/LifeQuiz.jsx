import { useState, useEffect } from "react";

const LIFE_VALUES = [
  { id: "health",     emoji: "💪", label: "健康",   desc: "身體狀態、精力、睡眠" },
  { id: "family",     emoji: "🏡", label: "家人",   desc: "與父母、子女和手足的關係" },
  { id: "romance",    emoji: "💕", label: "親密關係", desc: "伴侶、被愛與付出" },
  { id: "friendship", emoji: "🤝", label: "友誼",   desc: "深度友誼、社交連結" },
  { id: "finance",    emoji: "💰", label: "財務",   desc: "安全感、不被錢綁住的自由" },
  { id: "growth",     emoji: "🌱", label: "成長",   desc: "持續學習、成為更好的自己" },
  { id: "meaning",    emoji: "🕯️", label: "意義",   desc: "感覺存在有價值、有貢獻" },
  { id: "autonomy",   emoji: "🗝️", label: "自主",   desc: "時間與生活方式由自己決定" },
  { id: "experience", emoji: "✈️", label: "體驗",   desc: "旅行、冒險、嘗試新事物" },
  { id: "peace",      emoji: "🌙", label: "內在平靜", desc: "與自己和解、不被焦慮主導" },
  { id: "impact",     emoji: "🌏", label: "社會影響", desc: "改變社會、國家與世界" },
  { id: "career",     emoji: "💼", label: "職涯",   desc: "工作有方向、在乎自己做的事" },
];

const CAREER_LABELS = {
  money: { label: "財務報酬", emoji: "💰" },
  learning: { label: "持續學習", emoji: "🧠" },
  autonomy: { label: "自主掌控", emoji: "🎯" },
  impact: { label: "社會影響", emoji: "🌍" },
  growth: { label: "晉升發展", emoji: "🚀" },
  people: { label: "人際連結", emoji: "🤝" },
  balance: { label: "工作生活平衡", emoji: "🏡" },
  security: { label: "穩定安全", emoji: "🔒" },
  prestige: { label: "卓越聲望", emoji: "🏆" },
  creativity: { label: "創意創新", emoji: "💡" },
  leadership: { label: "領導影響", emoji: "👑" },
  expertise: { label: "專業深度", emoji: "🔬" },
  challenge: { label: "挑戰突破", emoji: "🌱" },
  culture: { label: "組織文化", emoji: "🏢" },
};

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

function computeRanking(scores) {
  return [...LIFE_VALUES]
    .map((v) => ({ ...v, score: scores[v.id] || 0 }))
    .sort((a, b) => b.score - a.score);
}

function satisfactionColor(val) {
  return ["#c0504d", "#d97c45", "#c9a84c", "#7aab6e", "#4e9a7a"][val - 1];
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
function ConflictAnalysis({ lifeRanked }) {
  let careerRanked = null;
  try { careerRanked = JSON.parse(localStorage.getItem("motive_career_ranked") || "null"); } catch (_) {}

  if (!careerRanked || careerRanked.length === 0) return null;

  const careerTop3 = careerRanked.slice(0, 3);
  const careerRankInLife = lifeRanked.findIndex(v => v.id === "career") + 1;

  const careerToLife = {
    money: "finance", learning: "growth", autonomy: "autonomy",
    impact: "impact", growth: "growth", people: "friendship",
    balance: "peace", security: "finance", prestige: "meaning",
    creativity: "experience", leadership: "impact", expertise: "growth",
    challenge: "experience", culture: "friendship",
  };

  const lifeTop3Ids = lifeRanked.slice(0, 3).map(v => v.id);
  const hasConflict = careerTop3.some(cv => {
    const lifeEquiv = careerToLife[cv];
    return lifeEquiv && !lifeTop3Ids.includes(lifeEquiv);
  });

  return (
    <div className="insight-box fade-up" style={{ animationDelay: "0.4s" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 14, textTransform: "uppercase" }}>
        ⚡ 職涯 × 人生的交叉分析
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#7a7870", marginBottom: 6 }}>職涯在你人生中的排名</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: careerRankInLife <= 3 ? "#c9a84c" : careerRankInLife <= 7 ? "#f0ead6" : "#9a9080" }}>
          第 {careerRankInLife} 位
        </div>
        <div style={{ fontSize: 13, color: "#b8b0a0", marginTop: 4, lineHeight: 1.8 }}>
          {careerRankInLife <= 3 && "職涯是你人生的核心驅動力，高度投入工作對你來說是自然狀態。"}
          {careerRankInLife > 3 && careerRankInLife <= 7 && "職涯對你重要，但不是人生的全部——其他面向同樣不可缺少。"}
          {careerRankInLife > 7 && "工作對你來說是手段，不是目的。你有更重要的事在等著你。"}
        </div>
      </div>

      <div style={{ height: 1, background: "#2a2720", margin: "14px 0" }} />

      <div style={{ fontSize: 12, color: "#7a7870", marginBottom: 8 }}>你在職涯中最追求的</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {careerTop3.map(v => {
          const info = CAREER_LABELS[v] || { label: v, emoji: "•" };
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
        {hasConflict
          ? `你在職涯中追求的，和你人生最重視的面向有落差。這不一定是問題——但值得問自己：你現在的工作選擇，是在服務你的人生，還是佔用了它？`
          : `你在職涯中追求的，和你人生最重視的面向高度一致——這是少數人擁有的清晰。你的工作本身就是人生的一部分，不是犧牲。`
        }
      </div>
    </div>
  );
}

// ── Satisfaction Slider ──
function SatisfactionSlider({ value, onChange, color }) {
  const labels = ["很不滿意", "不太滿意", "普通", "還不錯", "非常滿意"];
  return (
    <div>
      <input type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", marginBottom: 6 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{
            fontSize: 10, color: value === n ? color : "#7a7870",
            fontWeight: value === n ? 700 : 400, transition: "color 0.2s",
          }}>{labels[n - 1]}</span>
        ))}
      </div>
    </div>
  );
}

// ── Life Waitlist Modal ──
function LifeWaitlistModal({ onClose, top3 }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbySZQS4qFXzj7zBLENpvjDy2dZWOZEJTGkxHsOjKSMGWKqdzspTyloC1pu9QivriFJXbg/exec";

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) { setError("請輸入有效的 Email"); return; }
    setError(""); setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ name, email, message, quiz_type: "life", top3: top3.join(",") }),
      });
    } catch (_) {}
    setLoading(false); setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#141210", borderRadius: 10,
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
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 8 }}>深入了解你的人生地圖</h3>
              <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.8 }}>
                完整衝突分析與 AI 個人化建議正在開發中。<br />
                <span style={{ color: "#c9a84c" }}>留下 email，上線時第一個通知你，早鳥享優惠價。</span>
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>姓名（選填）</label>
                <input type="text" placeholder="你的名字" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, border: "1px solid #3a3730" }} />
              </div>
              <div>
                <label style={labelStyle}>Email <span style={{ color: "#c9a84c" }}>*</span></label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  style={{ ...inputStyle, border: `1px solid ${error ? "#c0504d" : "#3a3730"}` }} />
                {error && <p style={{ fontSize: 12, color: "#c0504d", marginTop: 5 }}>{error}</p>}
              </div>
              <div>
                <label style={labelStyle}>你最想了解什麼？（選填）</label>
                <textarea placeholder="例如：我覺得家人和工作之間一直有衝突⋯" value={message}
                  onChange={(e) => setMessage(e.target.value)} rows={3}
                  style={{ ...inputStyle, border: "1px solid #3a3730", resize: "none", lineHeight: 1.7 }} />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", background: loading ? "#5a5040" : "linear-gradient(135deg,#c9a84c,#e8c96a)",
              color: loading ? "#9a9080" : "#0f0e0c", border: "none", padding: "14px", borderRadius: 40,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Noto Serif TC', serif", letterSpacing: "0.05em", transition: "background 0.2s, color 0.2s",
            }}>
              {loading ? "送出中⋯" : "加入候補名單"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#7a7870", marginTop: 12 }}>不會發送垃圾郵件，只在功能上線時通知你一次</p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 12 }}>已收到！</h3>
            <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.8 }}>功能上線時會第一個通知你。<br />感謝你探索自己的人生地圖。</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: 24 }}>關閉</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step Dots ──
function StepDots({ phase }) {
  const steps = ["intro", "quiz", "satisfaction", "result"];
  const active = steps.indexOf(phase);
  const labels = ["開始", "比較", "現況", "結果"];
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
            {labels[i]}
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
      setPairs(generatePairs(LIFE_VALUES));
      const init = {};
      LIFE_VALUES.forEach((v) => (init[v.id] = 0));
      setScores(init);
      setCurrent(0);
      setCardAnim({ left: "", right: "" });
    }
    if (phase === "satisfaction") {
      const init = {};
      computeRanking(scores).slice(0, 5).forEach((v) => (init[v.id] = 3));
      setSatisfaction(init);
    }
    window.scrollTo(0, 0);
  }, [phase]);

  const handleChoose = (side) => {
    if (animating) return;
    const [li, ri] = pairs[current];
    const winner = side === "left" ? LIFE_VALUES[li].id : LIFE_VALUES[ri].id;
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

  const ranked = ["satisfaction", "result"].includes(phase) ? computeRanking(scores) : [];
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
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#c9a84c", marginBottom: 20, textTransform: "uppercase" }}>Motive</div>
            <div style={{ fontSize: 48, marginBottom: 24 }}>🗺️</div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.2, marginBottom: 16 }}>
              探索你的<br />人生地圖
            </h1>
            <p style={{ color: "#9a9080", fontSize: 15, lineHeight: 1.9, maxWidth: 380, margin: "0 auto 10px" }}>
              職涯只是人生的一部分。透過 12 個面向的配對比較，找出你真正的全局優先順序。
            </p>
            <p style={{ color: "#7a7870", fontSize: 13, marginBottom: 48 }}>
              36 題比較・現況評估・人生雷達圖・約 5 分鐘
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>開始測驗</button>
              {onBack && (
                <button onClick={onBack}
                  onMouseEnter={e => { e.currentTarget.style.color = "#b8b0a0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#9a9080"; e.currentTarget.style.transform = "translateY(0)"; }}
                  style={{ background: "none", border: "none", color: "#9a9080", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Serif TC',serif", marginTop: 12, transition: "color 0.2s,transform 0.1s" }}>← 返回職涯測驗</button>
              )}
            </div>
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && pairs.length > 0 && current < pairs.length && (
          <div>
            <StepDots phase="quiz" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12 }}>
              <span style={{ color: "#7a7870", fontSize: 12, flexShrink: 0 }}>{current + 1} / {pairs.length}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <span style={{ color: "#7a7870", fontSize: 12, flexShrink: 0 }}>{progress}%</span>
            </div>
            <p style={{ textAlign: "center", color: "#9a9080", fontSize: 14, marginBottom: 28, letterSpacing: "0.08em" }}>
              在人生中，你更重視哪一個？
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {[0, 1].map((side) => {
                const v = LIFE_VALUES[pairs[current][side]];
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
              <button className="btn-ghost" onClick={() => setPhase("intro")}>重新開始</button>
            </div>
          </div>
        )}

        {/* SATISFACTION */}
        {phase === "satisfaction" && (
          <div>
            <StepDots phase="satisfaction" />
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🪞</div>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(22px,4vw,34px)", marginBottom: 10 }}>現況對照</h2>
              <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
                這是你最重視的五個人生面向。<br />目前的生活，有沒有滿足它們？
              </p>
            </div>
            <div style={{ marginBottom: 32 }}>
              {top5.map((v, i) => (
                <div key={v.id} className="sat-card fade-up" style={{ animationDelay: i * 0.08 + "s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{v.emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, color: "#f0ead6", fontWeight: 600 }}>{v.label}</div>
                      <div style={{ fontSize: 12, color: "#7a7870" }}>{v.desc}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 20 }}>
                      {["😞", "😕", "😐", "🙂", "😊"][(satisfaction[v.id] || 3) - 1]}
                    </div>
                  </div>
                  <SatisfactionSlider
                    value={satisfaction[v.id] || 3}
                    onChange={(val) => setSatisfaction((prev) => ({ ...prev, [v.id]: val }))}
                    color={satisfactionColor(satisfaction[v.id] || 3)}
                  />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setPhase("quiz")}>重新比較</button>
              <button className="btn-primary" onClick={() => setPhase("result")}>查看我的全局觀</button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <div>
            <StepDots phase="result" />

            {/* Radar Chart */}
            <div className="fade-up" style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 20 }}>你的人生全局觀</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <RadarChart ranked={ranked} />
              </div>
            </div>

            {/* Top 5 */}
            <div className="fade-up" style={{ animationDelay: "0.1s", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 12, textTransform: "uppercase" }}>🏆 你最重視的面向</div>
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
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 14, textTransform: "uppercase" }}>📊 現況缺口</div>
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
                          {["很不滿意", "不太滿意", "普通", "還不錯", "非常滿意"][sat - 1]}
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
                  ? "你最重視的面向裡，有幾個在現實生活中沒有被好好滿足——這可能是你感到卡住的根源。"
                  : "你目前的生活整體還算符合你的核心優先順序。"}
              </p>
            </div>

            {/* Conflict Analysis */}
            <ConflictAnalysis lifeRanked={ranked} />

            {/* Paid CTA */}
            <div className="fade-up" style={{ animationDelay: "0.5s", marginBottom: 28 }}>
              <div style={{
                background: "linear-gradient(135deg,#1c1a10,#1c1a16)",
                border: "1px solid #c9a84c44", borderRadius: 20,
                padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,rgba(201,168,76,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 14 }}>完整分析</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#f0ead6", marginBottom: 12 }}>
                  深入了解你的衝突與解法
                </div>
                <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.9, maxWidth: 340, margin: "0 auto 24px" }}>
                  完整衝突分析、AI 個人化建議<br />以及可下載的人生設計報告
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
                  解鎖完整分析 NT$99
                </button>
                <p style={{ fontSize: 11, color: "#7a7870", marginTop: 12 }}>功能即將推出・早鳥優惠</p>
              </div>
            </div>

            {/* Full ranking */}
            <div className="divider" />
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#7a7870", textTransform: "uppercase", marginBottom: 10 }}>完整排名</div>
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
                    <span style={{ fontSize: 11, color: "#7a7870", width: 32, textAlign: "right" }}>{v.score}分</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {onBack && <button className="btn-ghost" onClick={onBack}>← 職涯測驗</button>}
              <button className="btn-ghost" onClick={() => setPhase("intro")}>回首頁</button>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>再測一次</button>
            </div>
          </div>
        )}
      </div>
      {showWaitlist && (
        <LifeWaitlistModal
          onClose={() => setShowWaitlist(false)}
          top3={ranked.slice(0, 3).map(v => v.label)}
        />
      )}
    </div>
  );
}
