# Batch 0001 — WhichToUse Phase 1 MVP

来源 seed：**WHICHTOUSE-2**（1 seed = 1 batch）。裁决记录见该 seed 的 release-gate 评论。
建立：2026-07-12。

## 交付工单（DAG: D1,D2 → D3 → D4 → D5 → D6）

| ref | ticket | 类型 | 一句话 | blocked_on |
|---|---|---|---|---|
| D1 | WHICHTOUSE-3 | enabler | DB 基座：schema + provision `whichtouse-schema` + 注入 DATABASE_URL | — |
| D2 | WHICHTOUSE-4 | enabler | 5 分类 + 种子目录页/信号源配置 | — |
| D3 | WHICHTOUSE-5 | enabler | wt-ingest 采集 skill（目录发现 + 逐候选独立调查，按 n-toaskill） | D1,D2 |
| D4 | WHICHTOUSE-6 | enabler | 每轨两维榜（overall≤10 + growth≤5）+ 综合 Best 3 | D3 |
| D5 | WHICHTOUSE-7 | **story** | 用途优先排名站（首屏分类→三轨+growth+Best3，紧凑浅色） | D1,D4 |
| D6 | WHICHTOUSE-8 | enabler | AI 友好：llms.txt + JSON API | D5 |

## 分类（5，🟢）
找客户/获客 · SEO/GEO · 内容写作 · 生成视频 · UI设计
