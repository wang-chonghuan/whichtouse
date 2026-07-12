# 0003 · tkt · D2 分类与数据源配置 (WHICHTOUSE-4)

- 日期：2026-07-12
- 类型：tkt（enabler）
- batch：0001-phase1-mvp
- 交付：
  - 5 个 🟢 分类入 `categories` 表：lead-gen / seo-geo / content-writing / video-generation / ui-design。
  - `resources/content/wt-sources.json`：每类种子目录页（aiagentsdirectory/theaiagentindex/PH/TAAFT）+ GitHub 关键词 + 每轨 overall/growth 信号源定义。
- 验收：5 分类在库（psql 验证）；wt-sources.json 落地、可被 D3 读取。
