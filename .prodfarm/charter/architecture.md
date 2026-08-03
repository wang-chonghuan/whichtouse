# architecture.md — 架构决策与约束

> 人类拥有；cap6 仅可把"已关闭工单承载的、可追溯的栈/架构/运维决定"沉淀进来。
> 依赖清单/版本以 lockfile 为准；模块级现状事实在 `.evodocs/modules/`。

## Stack & constraints

- **基座**：`tanstack-start`（TanStack Start SSR 单体，React 19 + TS + Node 24），**复用自 stemrobin 参照架构**。构建 Vite + Nitro → `app/.output`；单测独立 `app/vitest.config.ts`。
- **样式/设计系统**：**Astryx + StyleX，唯一样式权威**。整套观感是 `app/src/theme/neutralTheme.ts`（由 Astryx `neutral` 主题脚手架生成、本仓库自有的令牌文件），换肤只改这一个文件。组件优先用 `@astryxdesign/core`，自写 StyleX 仅用于布局且 `classNamePrefix: 'wt'`（避免与 Astryx 预编译 CSS 的原子类名冲突，见 README「Theming」）。Tailwind 已移除（两边都定义 `--color-accent`，Astryx 带 `!important` 会静默覆盖）；旧的 `demo/` 静态参照与 `DESIGN.md` 已随之删除，不再有可 diff 的设计基准。**约束：紧凑、浅色、无 landing、分类优先**（见 goal.md）。
- **品牌资产**：`app/public/` 下所有图标/社交卡片由 `app/scripts/gen-icons.mjs`（`npm run icons`）从 `resources/reference/wtu-logo.png` 生成，**不可手改**——下次跑脚本会覆盖。
- **数据库**：Azure easy-app 共享 PostgreSQL，per-project schema `whichtouse-schema`，经 `app/src/lib/db.ts`（`postgres` 客户端，惰性连接）。SSOT：`ssot-schemas/db-schemas/whichtouse.sql`。
- **部署**：Azure Container Apps `ca-whichtouse`，经 **n-easyapp**；根 `Dockerfile`（build context = repo 根，n-easyapp 硬编码，不可移动）。
- **无谓依赖铁律**见 `engineering-rules.md`。
- **布局**：`app/`（SSR 全栈）、`ssot-schemas/`、`resources/`、`infra/`。无 repo 根 package.json；命令从 `app/` 或 `npm --prefix app` 跑。

## 信息架构（产品核心）

分类（业务用途）× 三形态轨道（app-SaaS / skill / 开源）× 排名（轨道内 + 综合 Best 3）× （Phase 3）文章 × 选题-发布记录。字段与方法论见 `resources/reference/PRODUCT-GOAL.md` §3.4/§6。

## 数据获取原则（合规 + 轻量，核心）

> 2026-08-03 起，选源与 ETL 方法不再是红线，由编码 agent 自主决定（见 `redlines.md`）。转移的是责任不是约束——下面这几条是 agent 现在自己守的线，写在这里以便后来者知道当初为什么这么选。

- **不拖库、不镜像任何单一竞品整库**；每分类 × 每源只取 top-N（≈10），跨源汇编成**自己的库、自己打分**。这既规避欧盟数据库特殊权利与各源 ToS，本身也正是产品价值——榜单的价值在于横跨多源之后的判断，不在于任何单一来源的副本。
- 优先官方 API：GitHub、官方 MCP Registry、Glama、aiagentsdirectory `/api`、Product Hunt、StartupBase（saas 轨道主力）、Zapier 应用目录。明确封 bot 的源（PulseMCP、aiagentslist、Glama `ai-train=no`）只走官方 API，没有官方 API 就不用。
- **不把中转链接当身份。** 去重主键是 repo URL 与域名，但 Product Hunt 的 `website` 字段发的是 `producthunt.com/r/<hash>` 跳转，整类条目共享一个域名，于是同类目下第二条会认领第一条的身份并覆盖它的文案——`youmind` 挂上 Fathom 的介绍就是这么来的。跳转在服务端跟不动（`/r/` 走 Cloudflare，非浏览器一律 403，实测 99 条只过 12 条），所以处理办法是把这类域名排除在身份匹配之外，而不是解析它。
- **判类目要靠条目自己的文字，不靠是哪个查询找到它。** 归属闸门 `src/lib/category-rule.ts` 会拿候选词对全部 25 个类目打分并要求领先边际，否则丢弃；它从不改判到更合适的类目，因为没跑过那个类目的检索就没见过那里的竞争。
- **人看过的判决要能留下。** 打开链接后发现错分或已死的条目走 `retired_at`，行留着、排名清空——删掉只会明天被重新发现，同一个人再打开一次同一个死链。
- 数据源明细见 `resources/reference/MARKET-RESEARCH.md`。

## Phase 1 (MVP) 架构范围

- **数据管道（复用 stemrobin 模式）**：项目内 ingest skill `.agents/skills/wt-ingest/`（自带 package.json/node_modules，隔离 API 客户端依赖，不进 app bundle）**拉取 → 归一化/去重 → 原生信号打分 → 写入 PG（`whichtouse-schema`）**；**app 只从 PG 渲染**（分类 → 三轨 → 算法 Best 3）。手动跑一次，**不建 cron**（Phase 2 再加 cron + 多源 + LLM 分类 + 合成分/上升榜）。
- 单源/轨、约 5 个手挑分类、全部 provisional。
- **Phase 1 用 DB**（hello-world 阶段不用）：前置 enabler = provision PG role/schema（解 Gap #1）+ 给 Container App 注入 `DATABASE_URL`。**这两步涉及共享 PG admin / 项目库凭据，须按 redlines/凭据处理方式执行（人工跑或授权），不放命令行明文。**

## Complexity hotspots

- **真测的自动化边界**（Phase 3 生死线）：很多产品要注册/付费/接真实数据，未必能自动化真测——最高风险。
- **跨形态综合排名归一**：异形态数值不可直接比，用分类内名次百分位（Phase 2）。
