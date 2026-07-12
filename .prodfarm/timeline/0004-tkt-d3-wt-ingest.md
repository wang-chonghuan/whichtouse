# 0004 · tkt · D3 wt-ingest 采集 skill (WHICHTOUSE-5)

- 日期：2026-07-12
- 类型：tkt（enabler）
- batch：0001-phase1-mvp
- 交付：`.agents/skills/wt-ingest/`（n-toaskill hub-and-spoke：SKILL.md + package.json + scripts/lib + ingest.mjs）。
  - 两段式：目录发现（app 轨 aiagentsdirectory /api、repo/skill 轨 GitHub 关键词 + 专门 MCP 搜索）→ 逐候选调查（stars/upvotes + growth）→ 去重（url/域名主键，三轨不重叠）→ 写 items。
  - 认证：GitHub 用本机 `gh auth token`；aiagentsdirectory 公开。无 key baked in。
  - **growth 代理**：star/upvotes 速度（signal / 创建至今月数）——可靠、无额外 API 调用；provisional 代替 30 天时间戳（后者 stargazers 常 404 + 二级限流，不可靠）。
- 结果：5 类 × 3 轨各 ~12 条真实数据，overall + growth 双信号，全 provisional。
- 验收：手动跑一次，5类×3轨有真实条目、双信号、三轨无重复。skill 结构符合 n-toaskill。
