# 0006 · tkt · D5 用途优先排名站 (WHICHTOUSE-7, story)

- 日期：2026-07-12
- 类型：tkt（story）
- batch：0001-phase1-mvp
- 交付：
  - `app/src/lib/catalog.ts`：server fns（getCategories / getCategoryView），从 `whichtouse-schema` 读，DB 不进 client bundle。
  - `_app/index.tsx`：home = 分类列表（无 landing）。
  - `_app/c.$slug.tsx`：分类页 = Best 3 + 整体最高(3 轨×10) + 近一月增长最快(3 轨×5)。
  - `styles/wt.css`：紧凑、浅色、无深色、无大图标、密集三栏。
  - 顺带收紧 wt-ingest skill 发现（要求 repo 名含 mcp），清库重灌拿干净数据（反 slop）。
- 部署：ACR 构建 + `az containerapp update --revision-suffix`，新 revision r2f0ec52。
- 验收（双测，浏览器+curl 实证）：
  - 用户：home 见 5 分类；点分类两次点击内见三轨 overall + growth + Best 3。
  - 技术：线上 SSR 从库读真实数据；浅色/无 landing/紧凑符合红线；provisional 徽章渲染。
- Proxy decisions：Best 3 取每轨第一名（覆盖三形态）；growth 用速度代理；skill 轨 mcp-名过滤。
