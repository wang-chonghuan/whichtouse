# 0005 · tkt · D4 打分与两维榜 (WHICHTOUSE-6)

- 日期：2026-07-12
- 类型：tkt（enabler）
- batch：0001-phase1-mvp
- 交付：`.agents/skills/wt-ingest/scripts/rank.mjs`——从 items 重算 rankings：
  - overall：每类每轨 top 10（按 overall_signal）。
  - growth：每类每轨 top 5（按 growth_signal）。
  - Best 3：每轨第一名跨形态，按类内归一化信号（signal/轨内 max）排序，覆盖三形态。
- 结果：240 条 rankings（overall 150 + growth 75 + best3 15）。
- 验收：rankings 表含每类×3轨×(overall≤10 + growth≤5) + 每类 Best 3，有序、provisional。
- 已知 provisional 噪声：skill 轨泛词搜 MCP 有假阳性（可后续收紧 D3 过滤）。
