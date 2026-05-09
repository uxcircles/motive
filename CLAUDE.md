# 職涯價值觀探索測驗

## 專案概述
一個幫助使用者探索職涯價值觀的互動測驗，透過配對比較法找出排名，
並結合現況滿意度，給出職涯類型分析與推薦方向。

## 技術棧
- React（單一 JSX 檔案）
- Supabase（候補名單資料庫，待串接）
- 無後端，純前端

## 流程設計
1. 首頁（介紹）
2. 35 題配對比較（均勻抽樣演算法，每個價值觀至少出現 4 次）
3. 現況對照（前 5 名價值觀 × 滑桿評分）
4. 結果頁（職涯類型 + 缺口分析 + 推薦方向 + 候補名單 CTA）

## 顏色系統（背景 #0f0e0c）
| 色碼 | 用途 | 對比度 |
|------|------|--------|
| `#f0ead6` | 主要文字 | ~18:1 ✅ |
| `#c9a84c` | 強調金色 | ~7:1 ✅ |
| `#b8b0a0` | AI 分析內文 | ~6.5:1 ✅ |
| `#9a9080` | 次要說明／輔助資訊 | ~4.8:1 ✅ |
| `#7a7870` | 最淡提示（裝飾性） | ~3.5:1 |

> ⚠️ 舊顏色尚未完全替換：`#7a7060`、`#5a5048`、`#b0a890`、`#6a6058` → 請全部換成上表對應色碼

## 職涯類型（5種）
| 類型 | Emoji | 主色 | 對應 traits |
|------|-------|------|------------|
| 自主開創型 | 🎯 | #e8824a | autonomy, creativity, challenge |
| 成就驅動型 | 🏆 | #c9a84c | growth, prestige, money |
| 意義導向型 | 🌍 | #5a9e6f | impact, culture, people |
| 深度專家型 | 🔬 | #6a8fcf | expertise, learning, challenge |
| 穩健平衡型 | 🏡 | #9b7ec8 | security, balance, money |

## 價值觀列表（14個）
money, learning, autonomy, impact, growth, people, balance, security, prestige, creativity, leadership, expertise, challenge, culture

## 待完成
- [ ] 串接 Supabase waitlist 資料表
  - 欄位：`name`（text）、`email`（text, required）、`message`（text）、`created_at`（timestamp）
  - 在 WaitlistModal 的 `handleSubmit` 裡，把 `console.log` 換成 Supabase insert
- [ ] 確認所有顏色已套用新系統（搜尋舊色碼替換）
- [ ] 未來：串接 Claude API 做個人化分析（claude-sonnet-4-20250514）
- [ ] 未來：付費機制（目前用候補名單先收集需求驗證）

## 設計原則
- 主要行動按鈕（btn-primary）永遠放**右邊**
- 不加入能力評估，聚焦在價值觀探索
- 保持流程簡潔，避免步驟過多
- 所有文字顏色須符合 WCAG AA 標準

## 商業模式（規劃中）
目前策略：先免費跑，透過候補名單驗證使用者需求，確認有人願意付費後再接 AI 分析與付費機制。
未來可考慮一次性小額付費（NT$49–99）解鎖 AI 個人化分析。
