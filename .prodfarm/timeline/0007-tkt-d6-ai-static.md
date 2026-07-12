# 0007 · tkt · D6 AI 友好输出 (WHICHTOUSE-8)

- 日期：2026-07-12
- 类型：tkt（enabler）
- batch：0001-phase1-mvp
- 交付：`.agents/skills/wt-ingest/scripts/gen-ai-static.mjs` 从库生成静态 AI 输出到 `app/public/`：
  - `/llms.txt`（站点描述 + 分类索引 + 机读入口说明）。
  - `/api/categories.json`（分类列表）。
  - `/api/c/<slug>.json`（overall/growth/best3）。
- 设计决定：Phase 1 数据一次性 → **静态文件**（Nitro 服务），无需 server route，更适合 AI 抓取缓存。
- 部署：ACR 构建 + `az containerapp update`。
- 验收（线上 curl 实证）：/llms.txt 200 text/plain；/api/categories.json 200 json；/api/c/seo-geo.json 返回 best3 + 三轨 JSON。
