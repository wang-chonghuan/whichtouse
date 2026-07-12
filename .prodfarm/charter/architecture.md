# architecture.md — 架构决策与约束

> 人类拥有；cap6 仅可把"已关闭工单承载的、可追溯的栈/架构/运维决定"沉淀进来。
> 依赖清单/版本以 lockfile 为准；模块级现状事实在 `.evodocs/modules/`。

## Stack & constraints

- **基座**：`tanstack-start`（TanStack Start SSR 单体，React 19 + TS + Node 24），**复用自 stemrobin 参照架构**。构建 Vite + Nitro → `app/.output`；单测独立 `app/vitest.config.ts`。
- **样式/设计系统**：Tailwind CSS 4 + 设计令牌，复用 stemrobin（`resources/reference/DESIGN.md` / `DESIGN.guide.md`）。**约束：紧凑、浅色、无 landing、分类优先**（见 goal.md）。
- **数据库**：Azure easy-app 共享 PostgreSQL，per-project schema `whichtouse-schema`，经 `app/src/lib/db.ts`（`postgres` 客户端，惰性连接）。SSOT：`ssot-schemas/db-schemas/whichtouse.sql`。
- **部署**：Azure Container Apps `ca-whichtouse`，经 **n-easyapp**；根 `Dockerfile`（build context = repo 根，n-easyapp 硬编码，不可移动）。
- **无谓依赖铁律**见 `engineering-rules.md`。
- **布局**：`app/`（SSR 全栈）、`ssot-schemas/`、`resources/`、`infra/`。无 repo 根 package.json；命令从 `app/` 或 `npm --prefix app` 跑。

## 信息架构（产品核心）

分类（业务用途）× 三形态轨道（app-SaaS / skill / 开源）× 排名（轨道内 + 综合 Best 3）× （Phase 3）文章 × 选题-发布记录。字段与方法论见 `resources/reference/PRODUCT-GOAL.md` §3.4/§6。

## 数据获取原则（合规 + 轻量，核心）

- **不拖库、不镜像任何单一竞品整库**；每分类 × 每源只取 top-N（≈10），跨源汇编成**自己的库、自己打分**。规避欧盟数据库特殊权利/各源 ToS，也正是产品价值。
- 优先官方 API（GitHub / 官方 MCP Registry / Glama / aiagentsdirectory `/api` / Product Hunt）；封 bot 的（PulseMCP/aiagentslist/Glama ai-train=no）走官方 API 或不用；Product Hunt 默认禁商用。
- 去重以 repo URL / 域名为主键。数据源明细见 `resources/reference/MARKET-RESEARCH.md`。

## Phase 1 (MVP) 架构范围

单源/轨、原生信号排序、算法 Best 3 v1、一次性 ingest、**不建 cron、不接多源/合成分/上升榜**（那些是 Phase 2）。约 5 个手挑分类。MVP 不碰 DB（hello-world 已上线）。

## Complexity hotspots

- **真测的自动化边界**（Phase 3 生死线）：很多产品要注册/付费/接真实数据，未必能自动化真测——最高风险。
- **跨形态综合排名归一**：异形态数值不可直接比，用分类内名次百分位（Phase 2）。
