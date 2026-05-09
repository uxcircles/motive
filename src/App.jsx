import { useState, useEffect } from "react";

const VALUES = [
  { id: "money", emoji: "💰", label: "財務報酬", desc: "高薪與財務安全感" },
  { id: "learning", emoji: "🧠", label: "持續學習", desc: "不斷獲得新知與技能" },
  { id: "autonomy", emoji: "🎯", label: "自主掌控", desc: "決定自己的工作方式與節奏" },
  { id: "impact", emoji: "🌍", label: "社會影響", desc: "工作對世界有正向貢獻" },
  { id: "growth", emoji: "🚀", label: "晉升發展", desc: "有明確的職位成長路徑" },
  { id: "people", emoji: "🤝", label: "人際連結", desc: "與同事、客戶建立深厚關係" },
  { id: "balance", emoji: "🏡", label: "工作生活平衡", desc: "保有私人時間與彈性" },
  { id: "security", emoji: "🔒", label: "穩定安全", desc: "工作穩定、風險低" },
  { id: "prestige", emoji: "🏆", label: "卓越聲望", desc: "獲得他人認可與社會地位" },
  { id: "creativity", emoji: "💡", label: "創意創新", desc: "能發揮創造力與原創想法" },
  { id: "leadership", emoji: "👑", label: "領導影響", desc: "帶領他人、做出決策" },
  { id: "expertise", emoji: "🔬", label: "專業深度", desc: "在特定領域成為頂尖專家" },
  { id: "challenge", emoji: "🌱", label: "挑戰突破", desc: "面對困難問題、突破極限" },
  { id: "culture", emoji: "🏢", label: "組織文化", desc: "在認同價值觀的環境中工作" },
];

const CAREER_TYPES = {
  autonomous: {
    label: "自主開創型", emoji: "🎯", color: "#e8824a",
    traits: ["autonomy", "creativity", "challenge"],
    insight: "你需要的不只是一份好工作，而是一個讓你說了算的空間。你在框架外最有活力，重複性的工作對你來說是一種消耗。你天生適合從零開始建立東西。",
    tension: "自主與收入有時難以兼顧——自由工作的初期往往不穩定。你需要有意識地建立財務緩衝，才能真正享受自主帶來的自由。",
    careers: [
      { title: "創業 / 獨立顧問", reason: "完全掌控方向與節奏，每個決定都是你的" },
      { title: "產品設計師", reason: "結合創意與解決問題，能在組織內保有相對自主" },
      { title: "自由接案（設計、寫作、開發）", reason: "彈性高，能依興趣選擇專案" },
    ],
  },
  achiever: {
    label: "成就驅動型", emoji: "🏆", color: "#c9a84c",
    traits: ["growth", "prestige", "money"],
    insight: "你清楚知道自己想往哪裡走，而且不滿足於原地踏步。外部的認可對你來說不只是虛榮，而是確認自己走在對的路上的訊號。你在有明確晉升路徑的環境裡表現最好。",
    tension: "追求成就有時會壓縮生活空間。如果工作生活平衡在你的排名偏低，要留意長期下來的燃盡風險——成就感需要健康的身體來乘載。",
    careers: [
      { title: "企業管理 / 策略顧問", reason: "晉升路徑清晰，高績效有直接回報" },
      { title: "投資銀行 / 金融業", reason: "財務報酬豐厚，聲望明確" },
      { title: "科技公司產品或業務主管", reason: "成長空間大，外部認可度高" },
    ],
  },
  meaningful: {
    label: "意義導向型", emoji: "🌍", color: "#5a9e6f",
    traits: ["impact", "culture", "people"],
    insight: "你需要相信自己做的事是有意義的。一份薪水再高但感覺在浪費時間的工作，對你來說是一種折磨。人與人之間的連結也是你工作動力的重要來源。",
    tension: "意義導向的工作有時薪資相對低。你需要提前想清楚「夠用」的財務底線是多少，才不會讓現實壓垮理想。",
    careers: [
      { title: "社會企業 / NGO 工作者", reason: "直接貢獻，使命感強" },
      { title: "教育工作者 / 培訓師", reason: "影響人的成長，人際連結豐富" },
      { title: "企業 CSR / 永續發展部門", reason: "在商業組織內追求社會影響" },
    ],
  },
  expert: {
    label: "深度專家型", emoji: "🔬", color: "#6a8fcf",
    traits: ["expertise", "learning", "challenge"],
    insight: "你對「把一件事做到極致」有強烈的執著。淺嘗輒止對你來說不夠過癮，你需要不斷深入才能感到滿足。你是那種願意花幾年鑽研一個領域的人。",
    tension: "專業深度有時讓人難以跨界。在快速變化的產業，要留意是否需要定期更新自己的專業方向，避免被單一技能綁死。",
    careers: [
      { title: "研究員 / 學者", reason: "有充分空間深耕，以知識為核心" },
      { title: "技術專家（工程師、醫師、律師）", reason: "專業深度直接轉化為價值" },
      { title: "顧問（特定領域）", reason: "以專業知識提供解方，持續學習" },
    ],
  },
  steady: {
    label: "穩健平衡型", emoji: "🏡", color: "#9b7ec8",
    traits: ["security", "balance", "money"],
    insight: "你清楚知道工作是生活的一部分，而不是全部。你需要的是一個穩定的基礎，讓你在工作之外也能好好生活。這不是沒有野心，而是對「好的生活」有自己的定義。",
    tension: "穩定與成長有時相互拉扯。偶爾問問自己：現在的穩定是在保護你，還是在限制你？",
    careers: [
      { title: "公務員 / 國營事業", reason: "穩定性高，福利完善，下班後有自己的時間" },
      { title: "金融業中後台 / 會計", reason: "穩定收入，工作內容規律可預測" },
      { title: "大企業內部職能（HR、法務、財務）", reason: "安全感高，有完整的制度支撐" },
    ],
  },
};

function detectType(ranked) {
  const top3ids = ranked.slice(0, 3).map((v) => v.id);
  let bestType = "expert";
  let bestScore = -1;
  for (const [key, type] of Object.entries(CAREER_TYPES)) {
    const score = type.traits.filter((t) => top3ids.includes(t)).length;
    if (score > bestScore) { bestScore = score; bestType = key; }
  }
  return CAREER_TYPES[bestType];
}

function generatePairs(values) {
  const n = values.length;
  const targetPairs = 35;
  const minAppearances = 4;

  // Generate all possible pairs
  const allPairs = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) allPairs.push([i, j]);

  // Shuffle all pairs
  for (let i = allPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
  }

  const selected = [];
  const appearances = new Array(n).fill(0);

  // First pass: ensure every value appears at least minAppearances times
  for (const pair of allPairs) {
    if (selected.length >= targetPairs) break;
    const [a, b] = pair;
    if (appearances[a] < minAppearances || appearances[b] < minAppearances) {
      selected.push(pair);
      appearances[a]++;
      appearances[b]++;
    }
  }

  // Second pass: fill remaining slots from unused pairs
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
  return [...VALUES]
    .map((v) => ({ ...v, score: scores[v.id] || 0 }))
    .sort((a, b) => b.score - a.score);
}

function satisfactionColor(val) {
  return ["#c0504d", "#d97c45", "#c9a84c", "#7aab6e", "#4e9a7a"][val - 1];
}

// ── Waitlist Modal ──
function WaitlistModal({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbySZQS4qFXzj7zBLENpvjDy2dZWOZEJTGkxHsOjKSMGWKqdzspTyloC1pu9QivriFJXbg/exec";

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError("請輸入有效的 Email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ name, email, message }),
      });
    } catch (_) {
      // Apps Script no-cors fetch always throws — submission still goes through
    }
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#141210", borderRadius: 10,
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
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 18, background: "transparent",
            border: "none", color: "#7a7870", fontSize: 20, cursor: "pointer",
          }}
        >✕</button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 8 }}>
                個人深入分析
              </h3>
              <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.8 }}>
                人生設計測驗正在開發中，包含完整衝突分析、AI 個人化建議與人生設計報告。
                <br /><span style={{ color: "#c9a84c" }}>留下 email，上線時第一個通知你，早鳥享優惠價。</span>
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>姓名（選填）</label>
                <input
                  type="text" placeholder="你的名字" value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, border: "1px solid #3a3730" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email <span style={{ color: "#c9a84c" }}>*</span></label>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  style={{ ...inputStyle, border: `1px solid ${error ? "#c0504d" : "#3a3730"}` }}
                />
                {error && <p style={{ fontSize: 12, color: "#c0504d", marginTop: 5 }}>{error}</p>}
              </div>
              <div>
                <label style={labelStyle}>你最想了解什麼？（選填）</label>
                <textarea
                  placeholder="例如：我不確定該繼續往上爬還是換跑道⋯"
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, border: "1px solid #3a3730", resize: "none", lineHeight: 1.7 }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", background: loading ? "#5a5040" : "linear-gradient(135deg,#c9a84c,#e8c96a)",
                color: loading ? "#9a9080" : "#0f0e0c", border: "none", padding: "14px", borderRadius: 40,
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Noto Serif TC', serif", letterSpacing: "0.05em",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {loading ? "送出中⋯" : "加入候補名單"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#7a7870", marginTop: 12 }}>
              不會發送垃圾郵件，只在功能上線時通知你一次
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#f0ead6", marginBottom: 12 }}>
              已收到！
            </h3>
            <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.9, marginBottom: 28 }}>
              {name ? name + "，" : ""}功能上線後我們會寄信通知你。<br />感謝你的支持 ✨
            </p>
            <button
              onClick={onClose}
              style={{
                background: "transparent", color: "#c9a84c", border: "1px solid #c9a84c",
                padding: "10px 28px", borderRadius: 40, fontSize: 14, cursor: "pointer",
                fontFamily: "'Noto Serif TC', serif",
              }}
            >
              回到結果
            </button>
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

// ── Satisfaction Slider ──
function SatisfactionSlider({ value, onChange, color }) {
  const labels = ["很不滿意", "不太滿意", "普通", "還不錯", "非常滿意"];
  return (
    <div>
      <input
        type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", marginBottom: 6 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{
            fontSize: 10,
            color: value === n ? color : "#7a7870",
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
  const [phase, setPhase] = useState("intro");
  const [pairs, setPairs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({});
  const [cardAnim, setCardAnim] = useState({ left: "", right: "" });
  const [animating, setAnimating] = useState(false);
  const [satisfaction, setSatisfaction] = useState({});
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    if (phase === "quiz") {
      setPairs(generatePairs(VALUES));
      const init = {};
      VALUES.forEach((v) => (init[v.id] = 0));
      setScores(init);
      setCurrent(0);
      setCardAnim({ left: "", right: "" });
    }
    if (phase === "satisfaction") {
      const init = {};
      computeRanking(scores).slice(0, 5).forEach((v) => (init[v.id] = 3));
      setSatisfaction(init);
    }
  }, [phase]);

  const handleChoose = (side) => {
    if (animating) return;
    const [li, ri] = pairs[current];
    const winner = side === "left" ? VALUES[li].id : VALUES[ri].id;
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
  const careerType = phase === "result" ? detectType(ranked) : null;
  const progress = pairs.length > 0 ? Math.round((current / pairs.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Noto Serif TC', Georgia, serif", minHeight: "100vh", background: "#0f0e0c", color: "#f0ead6" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background:#1c1a16; border:1px solid #3a3730; border-radius:20px; padding:32px 24px; cursor:pointer; transition:transform 0.15s,border-color 0.15s,box-shadow 0.15s; position:relative; overflow:hidden; width:100%; max-width:255px; min-height:210px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; user-select:none; }
        .card:hover { border-color:#c9a84c; box-shadow:0 0 28px rgba(201,168,76,0.15); transform:translateY(-4px); }
        .card.winner { border-color:#c9a84c; box-shadow:0 0 48px rgba(201,168,76,0.3); transform:scale(1.05); background:#221f18; animation:winPulse 0.5s ease; }
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
        .btn-ghost { background:transparent; color:#9a9080; border:1px solid #9a9080; padding:10px 24px; border-radius:40px; font-size:14px; cursor:pointer; font-family:'Noto Serif TC',serif; transition:border-color 0.2s,color 0.2s; }
        .btn-ghost:hover { border-color:#f0ead6; color:#f0ead6; }
        .sat-card { background:#1c1a16; border:1px solid #2a2720; border-radius:16px; padding:22px 24px; margin-bottom:12px; }
        .insight-box { background:#141210; border:1px solid #2a2720; border-radius:14px; padding:20px 22px; margin-bottom:12px; position:relative; overflow:hidden; }
        .insight-box::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent); }
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
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#c9a84c", marginBottom: 20, textTransform: "uppercase" }}>Motive</div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(32px,6vw,52px)", lineHeight: 1.2, marginBottom: 16 }}>
              解鎖你的<br />職涯驅動力
            </h1>
            <p style={{ color: "#9a9080", fontSize: 15, lineHeight: 1.9, maxWidth: 380, margin: "0 auto 10px" }}>
              透過三個步驟，找出你真正在乎什麼、現況有沒有滿足你，以及適合你的職涯方向。
            </p>
            <p style={{ color: "#7a7870", fontSize: 13, marginBottom: 48 }}>
              35 題比較・現況評估・職涯類型分析・約 5 分鐘
            </p>
            <button className="btn-primary" onClick={() => setPhase("quiz")}>開始測驗</button>
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
              在工作中，你更重視哪一個？
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {[0, 1].map((side) => {
                const v = VALUES[pairs[current][side]];
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
                這是你最重視的五個價值觀。<br />在目前的工作中，它們有沒有被滿足？
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
              <button className="btn-primary" onClick={() => {
                const r = computeRanking(scores);
                localStorage.setItem("motive_career_ranked", JSON.stringify(r.map(v => v.id)));
                setPhase("result");
              }}>查看我的結果</button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && careerType && (
          <div>
            <StepDots phase="result" />

            {/* Type */}
            <div className="fade-up" style={{
              borderRadius: 20, padding: "28px 24px", marginBottom: 24,
              background: "linear-gradient(135deg," + careerType.color + "22,#1c1a16)",
              border: "1px solid " + careerType.color + "55",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: careerType.color, textTransform: "uppercase", marginBottom: 10 }}>你的職涯類型</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 42 }}>{careerType.emoji}</span>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(24px,4vw,36px)", color: "#f0ead6" }}>{careerType.label}</h2>
              </div>
            </div>

            {/* Insight */}
            <div className="insight-box fade-up" style={{ animationDelay: "0.1s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 10, textTransform: "uppercase" }}>🔍 你的核心驅動力</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "#b8b0a0" }}>{careerType.insight}</p>
            </div>

            <div className="insight-box fade-up" style={{ animationDelay: "0.2s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 10, textTransform: "uppercase" }}>⚖️ 值得注意的取捨</div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "#b8b0a0" }}>{careerType.tension}</p>
            </div>

            {/* Satisfaction Gap */}
            <div className="insight-box fade-up" style={{ animationDelay: "0.3s" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 14, textTransform: "uppercase" }}>📊 現況缺口分析</div>
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
                  ? "你最重視的價值觀裡，有幾項在現職沒有被好好滿足。這可能是你感到卡關或不滿足的根源。"
                  : "你目前的工作整體還算符合你的核心價值觀，繼續留意是否有成長空間。"}
              </p>
            </div>

            {/* Career Recommendations */}
            <div className="fade-up" style={{ animationDelay: "0.4s", marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: 16, textTransform: "uppercase" }}>🗺️ 適合你的職涯方向</div>
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
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 14 }}>下一步</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#f0ead6", marginBottom: 12, lineHeight: 1.4 }}>
                  職涯只是人生的一部分
                </div>
                <p style={{ color: "#9a9080", fontSize: 13, lineHeight: 1.9, maxWidth: 340, margin: "0 auto 24px" }}>
                  你知道自己在工作中重視什麼了。<br />
                  但這跟你想要的人生一致嗎？<br />
                  <span style={{ color: "#c9a84c" }}>人生設計測驗</span>幫你建立完整的全局觀——找出職涯、關係、健康、意義之間的真正優先順序。
                </p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <a
                    href="#life"
                    style={{
                      background: "linear-gradient(135deg,#c9a84c,#e8c96a)", color: "#0f0e0c",
                      border: "none", padding: "14px 32px", borderRadius: 40,
                      fontSize: 15, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Noto Serif TC',serif", letterSpacing: "0.05em",
                      textDecoration: "none", display: "inline-block",
                    }}
                  >
                    開始人生設計測驗（免費）
                  </a>
                  <button
                    onClick={() => setShowWaitlist(true)}
                    style={{
                      background: "transparent", color: "#9a9080",
                      border: "1px solid #3a3730", padding: "10px 24px", borderRadius: 40,
                      fontSize: 13, cursor: "pointer",
                      fontFamily: "'Noto Serif TC',serif",
                    }}
                  >
                    訂閱 AI 個人化分析通知 NT$99
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#7a7870" }}>AI 分析功能即將推出・留下 email 優先體驗・早鳥優惠</p>
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
              <button className="btn-ghost" onClick={() => setPhase("intro")}>回首頁</button>
              <button className="btn-primary" onClick={() => setPhase("quiz")}>再測一次</button>
            </div>
          </div>
        )}
      </div>

      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </div>
  );
}
