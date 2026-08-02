# WHICHTOUSE-21 · 修复发现流程的类目归属判定

以下为 plane 工单 WHICHTOUSE-21 的完整描述（冻结契约），其后内联本项目 charter 全文与相关 evodocs 模块，供执行者自足使用。

---

## Meta
- Type: enabler
- Batch: 无
- Origin: human
- Seed: 无
- Lane: standard

## Scope
每日发现任务在为候选项确定类目时没有独立的判定环节：类目由「哪一组按类目发起的搜索命中了它」隐含决定，查询字符串本身承担了分类器的职责，而其中多个类目的查询是单个常用英文词。
后果已量化：当前 287 行 emerging 中 100 行归属错误，已逐条开链人工核对并在库中标注（emerging 且 best_for 为空串的行即该集合）。其中 Data Analysis 与 Customer Support 两个类目 11/11 全错；同一个团队邮件客户端被同时写入 Meeting Notes、Legal & Contracts、Workflow Automation 三个类目。另有一类错误来自子串匹配：表示「恢复中断会话」的 resume 命中了简历类目。
需要交付的能力：候选项在写入前统一对全部 25 个类目做一次归属判定，判定不足者丢弃而非默认归入搜到它的类目。当前「新行需两个独立来源佐证」的要求被部分数据源整体绕过，需要一并收紧——但注意 skill 轨道的全部来源都是 GitHub，绝对要求两来源会使该轨道清空，收紧方式需在此约束下成立。

## Constraints
- 不得改变 leading 行的类目归属与排序：leading 来自人工语料，其类目由人决定。
- 不得删除、覆盖或重新生成库中已有的 100 行错分标注——它们是本次改动唯一的评估基准。
- 不得通过整体收紧到使任一类目的 emerging 榜单为空或近乎为空来达成验收。
- 归属判定不确定时必须丢弃候选项，不得回落到任何默认类目。
- 不得新增、移除或更换任何依赖、外部服务或付费 API。
- 不得触碰 .prodfarm/charter/ 下的任何文件。
- 不得改变每个榜单最多 10 条的既有上限。

## Acceptance criteria
- 对现有 287 行 emerging 候选重新做一次归属判定后，此前被标注为错分的 100 行中至少 80 行不再归入其原类目。
- 重新判定后，Data Analysis 与 Customer Support 两个类目各自不再包含任何一条此前被标注为错分的行。
- 任取三个类目，逐条打开其 emerging 榜单条目核对，每个榜单中不属于该类目的条目不超过一条。
---

# 项目 charter（实时内联，执行者必须遵守）

## charter/goal.md

# goal.md — WhichToUse 北极星（人类专属领地）

> 机器只对照它评分、判断达成度，**从不修改**。完整意图与调研见
> `resources/reference/PRODUCT-GOAL.md`（v4）+ `resources/reference/MARKET-RESEARCH.md`。

## 一句话

**一个按"业务用途"组织、把 app/SaaS、skill、开源项目三种形态各自排名并给出综合 Best 3 的紧凑、诚实的 agent 产品排名站（whichtouse.com）；靠双语自媒体分发，免费 skill 拉信任、收费产品做 affiliate；并刻意做成 AI 可引用的来源。**

Tagline：*The honest ranking of AI agents, by what you're doing.*

## 要解决的痛点

现有目录都按"产品类型"切、且不可信（厂商提交/SEO/付费收录/众评，不动手测）；没有人做"**按业务用途横切、跨形态（SaaS+skill+开源）、且真测**"的排名。这是有结构性原因、别人无动机填的空白。

## 护城河（成败序）

1. **真测是承重墙**：唯一护城河是可信的动手评测；它同时解掉三坑——内容 AI 检测、数据爬取 ToS、排名可信度。只爬不测 = 沦为第 N 个聚合器。
2. 跨形态 + 用途优先 + 可辩护 Best 3（无人做全）。
3. 紧凑诚实 UI（竞品臃肿是被 SEO/广告/厂商提交逼的，我们无此压力→防御性优势）。
4. 双语分发（英文站 + 中文 KOL 打法，两拨竞争者都复制不了另一半）。
5. 成为 AI 会引用的排名。

## 变现

主：affiliate（美元，只对商业 SaaS 层）+ 自有 newsletter；免费 skill/开源拉信任、收费产品收割。**红线：不碰厂商赞助/付费收录**。信任层（编码/开源，无 affiliate）与变现层（写作/视频/语音 SaaS）刻意配比。

## 分阶段（当前：Phase 1 = MVP）

- **Phase 1｜MVP：只有网站**——公开、紧凑、按用途看三形态头部；少量分类、单源、原生信号排序、算法 Best 3 v1、一次性 ingest。不评测、不发文、不接 affiliate。
- **Phase 2｜完整数据管线**——多源汇编 + 名次归一合成分 + 全量分类 + 映射表 + 本月上升榜 + cron。
- **Phase 3｜评测 + 文章 + 分发**——真测随文章做；affiliate；beehiiv + dev.to/Hashnode + X。

## 达成判据（Phase 1）

公开 URL 可访问；按业务用途组织、每类三轨（app/skill/开源）有来自真实源的条目；两次点击见答案；UI 紧凑、浅色、无 landing、诚实标注 provisional。

## charter/redlines.md

# redlines.md — 需人类批准的封闭动作清单（只查表，不判断）

> 命中即触发 abort 评估；机器绝不代人回答、代人执行。cap2 按四固定类别播种，**人类确认并拥有本文件**。
> 状态：✅ 人类已确认（2026-07-12）。goal.md 同时确认。

## 四固定类别

1. **对外部系统的破坏性或首次写入**：云资源创建/删除、公开发布、发送邮件/消息。
   - 本项目具体化：向 X/dev.to/Hashnode/beehiiv/知乎/掘金等**发布内容**（对外发布，须人过目）；新建/删除 Azure 资源；首次绑定域名。
2. **不可逆数据操作**：删除或污染已积累的生产数据（含生产 PG `whichtouse-schema` 的破坏性写入）。
3. **超阈值花费**：付费 API/订阅、超额云开销。
4. **修改 `goal.md`**。

## 项目补充（人类可增删）

- **数据合规**：镜像/拖取任何单一竞品的整库、爬取 robots 封 bot 的源、把 Product Hunt 数据用于商用——命中须人类批准（见 architecture.md 数据获取原则）。
- **接入厂商赞助/付费收录**（违背核心变现红线，见 goal.md）。

## charter/engineering-rules.md

# engineering-rules.md — 编码规范与戒律（编码 agent 必须遵守）

> 人类拥有，机器不写。随 charter 注入每张工单。

## 无谓依赖铁律（cap2 播种，人类确认拥有）

**若现有架构与技术栈能实现需求，禁止新增/删除/改动任何库或依赖——用现有栈解决。** 依赖变更仅在"现有架构确实无法满足需求 **且** 由人类授权的工单/seed 承载该决定"时才允许（cap6 随后记入 `architecture.md`）。机器绝不在开发中自行改栈：发现栈不够又无授权工单，是给人类的产品决策 → abort/boundary，绝不 silent `npm install`。

## 通用戒律

- **想清楚再写**：先读相关代码与 charter，最小手术式改动，别顺手重构。
- **SSOT**：数据契约以 `ssot-schemas/db-schemas/whichtouse.sql` 为唯一真源；前后端/任务共用它，不各写一份。
- **DB 访问**：只经 `app/src/lib/db.ts`（server-only、惰性连接、schema `whichtouse-schema`）；连接串是服务器密钥，绝不进浏览器 bundle。
- **验证靠真跑**：以浏览器/runbook 命令实际运行产品来验证，绝不"看代码想象"。
- **诚实优先于产能**：Phase 1 未测的排名一律标 `provisional`；不假装评测过。不写 TEMP/降级分支/mock 绕过失败的外部依赖——宁可 abort。
- **简单有效优先**：v1 不追求复杂；每阶段只做该阶段最小集。
- **设计系统说了算**：UI 一律用 `@astryxdesign/core` 组件搭（`npx @astryxdesign/cli component <Name>` / `docs layout`），别先写 `<div>`。颜色/间距/圆角只用语义令牌，字面量一律进 `app/src/theme/neutralTheme.ts`。**组件已经拥有的属性用它自己的 prop 设，不要用 `xstyle`**——Astryx 预编译 CSS 带 `:not(#\#)` 提权，消费侧同名属性会静默失效。
- **git**：主分支保护；改动走工单对应的 worktree（n-im 驱动）。

## 数据采集纪律（Phase 2 起）

多源汇编 + 自有打分，**不拖库、不镜像单一竞品库**；优先官方 API；封 bot 的源走其官方 API 或不用。详见 `architecture.md`。

## charter/architecture.md

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

- **不拖库、不镜像任何单一竞品整库**；每分类 × 每源只取 top-N（≈10），跨源汇编成**自己的库、自己打分**。规避欧盟数据库特殊权利/各源 ToS，也正是产品价值。
- 优先官方 API（GitHub / 官方 MCP Registry / Glama / aiagentsdirectory `/api` / Product Hunt）；封 bot 的（PulseMCP/aiagentslist/Glama ai-train=no）走官方 API 或不用；Product Hunt 默认禁商用。
- 去重以 repo URL / 域名为主键。数据源明细见 `resources/reference/MARKET-RESEARCH.md`。

## Phase 1 (MVP) 架构范围

- **数据管道（复用 stemrobin 模式）**：项目内 ingest skill `.agents/skills/wt-ingest/`（自带 package.json/node_modules，隔离 API 客户端依赖，不进 app bundle）**拉取 → 归一化/去重 → 原生信号打分 → 写入 PG（`whichtouse-schema`）**；**app 只从 PG 渲染**（分类 → 三轨 → 算法 Best 3）。手动跑一次，**不建 cron**（Phase 2 再加 cron + 多源 + LLM 分类 + 合成分/上升榜）。
- 单源/轨、约 5 个手挑分类、全部 provisional。
- **Phase 1 用 DB**（hello-world 阶段不用）：前置 enabler = provision PG role/schema（解 Gap #1）+ 给 Container App 注入 `DATABASE_URL`。**这两步涉及共享 PG admin / 项目库凭据，须按 redlines/凭据处理方式执行（人工跑或授权），不放命令行明文。**

## Complexity hotspots

- **真测的自动化边界**（Phase 3 生死线）：很多产品要注册/付费/接真实数据，未必能自动化真测——最高风险。
- **跨形态综合排名归一**：异形态数值不可直接比，用分类内名次百分位（Phase 2）。

## charter/runbook.md

# runbook.md — 运维手册（可直接执行，repo 根相对）

> 感知（实证验证）用它启动产品。密钥用占位符 + 获取方式表达。

## 开发 / 构建 / 测试

| 用途 | 命令 |
|---|---|
| 安装 | `cd app && npm ci` |
| 本地开发 | `cd app && npm run dev` → http://localhost:5200/（端口固定 5200，见 `app/vite.config.ts`） |
| 构建 | `cd app && npm run build`（生成 `src/routeTree.gen.ts` + `.output/`） |
| 本地起生产 | `cd app && PORT=5200 HOST=127.0.0.1 node .output/server/index.mjs` → http://127.0.0.1:5200/ |
| 单测 | `cd app && npm test`（vitest） |
| E2E | `cd app && npm run e2e`（playwright） |

## 部署（n-easyapp）

- **线上**：https://whichtouse.com/ （自定义域名，Cloudflare DNS + Azure 托管证书自动续期；apex A 记录必须灰云 DNS-only）。容器直连地址仍为 https://ca-whichtouse.kindsmoke-4d84c417.northeurope.azurecontainerapps.io/
- Container App `ca-whichtouse` / `rg-easyapp-shared` / env `cae-easyapp-shared` / northeurope；镜像 `acreasyapp.azurecr.io/whichtouse:latest`；端口 3000；min/max replicas 1。
- **重部署**（既定路径，redlines 已为此路径豁免）：
  1. **在 repo 根**（不是 `app/`）：`az acr build --registry acreasyapp --image whichtouse:latest --file Dockerfile .`
  2. `az containerapp update -g rg-easyapp-shared -n ca-whichtouse --image acreasyapp.azurecr.io/whichtouse:latest --revision-suffix "$(git rev-parse --short HEAD)"`
  - 或走 **n-easyapp cap2**（redeploy-current-repo）。
  - ⚠️ **两个实测坑**：① 镜像 tag 固定为 `latest`，不带 `--revision-suffix` 时模板哈希不变，Container Apps **不会拉新镜像**（旧修订版继续跑，命令仍报 Succeeded）；② 第 1 步必须在 repo 根执行，否则报 `Unable to find 'Dockerfile'` —— 而此时第 2 步仍会"成功"地用**旧镜像**滚一个新修订版。构建失败务必不要继续 update。
  - 验证：`az containerapp revision list -g rg-easyapp-shared -n ca-whichtouse --query "[?properties.active]" -o table` 确认新后缀在跑，再 `curl -s -o /dev/null -w "%{http_code}" https://whichtouse.com/`。
- 前提：`az account show` 已登录（Sponsorship 订阅）。

## 数据库

- 共享 Azure PG `pg-easyapp-shared`，db `easyapp`，per-project schema `whichtouse-schema`，role `whichtouse-user`。连接经 `EASYAPP_DATABASE_URL`/`DATABASE_URL`（`app/src/lib/db.ts`）。
- **✅ 已 provision（D1/WHICHTOUSE-3）**：role `whichtouse-user`（派生密码）+ schema `whichtouse-schema` 已建；线上 `ca-whichtouse` 已注入 `DATABASE_URL`/`DATABASE_SCHEMA`。
- **表结构（2026-07-26 起）**：两张表 `categories` + `listings`，源 `ssot-schemas/db-schemas/whichtouse.sql`，设计见 `specs/content-in-db.md`。旧的 `items`/`rankings` 已随该文件的 `drop table` 一并淘汰（信号驱动设计，与实际内容不匹配）。**不留历史**：每次 refresh job 就地覆盖。
- **内容装载**：`node app/scripts/import-content.mjs`（`--dry` 只解析不写）。从 `app/src/content/c/*.json` 灌 25 个分类 / 372 条 listing（saas 164 · oss 143 · skill 65）。JSON 语料保留在 git 里作为 seed of record。
- **每日重排**：`app/jobs/refresh.mjs` → 构建时由 `scripts/build-jobs.mjs` 打包进 `.output/jobs/refresh.mjs`（运行时镜像只 COPY `.output`）。源白名单在 `app/src/content/sources.json`。本地跑：`node --env-file=.env .output/jobs/refresh.mjs [--dry] [--category <slug>]`。
- **job 的两个 env（已注入，2026-07-31）**：`GITHUB_TOKEN` + `PRODUCTHUNT_TOKEN`，均以 Container Apps Job secret 形式存在（`secretref:github-token` / `secretref:producthunt-token`），值同时保存在仓库根 `.env`（gitignored，600）。
  - GitHub 用的是**零 scope** classic PAT（`x-oauth-scopes` 为空，写操作返回 404），无过期。它不提供任何匿名互联网没有的能力，唯一作用是限流 10→30 次/分、60→5000 次/时。
  - Product Hunt 用 developer token，按 topic slug 查询（`sources.json` 的 `phTopics`）。**注意**：早期版本传 `query.split(' ')[0]`，即每个分类都是 `"ai"`，而 `"ai"` 不是合法 slug —— 该源对 25 个分类**全部返回 0 条且不报错**。改源时务必用"必中样本"验证，不要只看 `sourceErrors`。
  - 换 key：`az containerapp job secret set -g rg-easyapp-shared -n caj-whichtouse-refresh --secrets github-token=<v>`，job 下次执行即生效，不必重新部署。
- **job 的安全边界（改代码前先读 `specs/content-in-db.md` §3.1）**：不碰任何正文和 `reviewed_at`；不动 `saas`+`leading`（一期人工排序）；不动 `watchlist`。**已 review 的条目一定保留名次**——某次源全挂也不会让它掉出榜单。新发现的条目只进 `emerging`，且必须有 **2 个不同 origin** 佐证（`github-stars` 和 `github-new` 同属 `github`，互相印证不算数）。
- **本地连库**（开发/迁移用）：`.pgpass` 放 `pg-easyapp-shared...:5432:easyapp:whichtouse-user:<PGPASSWORD>`（600 权限），`PGPASSFILE=<路径> psql "host=pg-easyapp-shared.postgres.database.azure.com port=5432 dbname=easyapp user=whichtouse-user sslmode=require"`。**凭据只走 .pgpass/env-file，不进命令行明文，也不写进本 charter**。`<PGPASSWORD>` 获取方式：仓库根 `.env` 的 `EASYAPP_DATABASE_URL`（未提交），或线上 `az containerapp show -g rg-easyapp-shared -n ca-whichtouse` 的 `DATABASE_URL` 环境变量。本机 IP 需在 PG 防火墙（规则 `allow-wt-dev-*`）。
- 改 schema：编辑 `whichtouse.sql` → 以 admin 或 `whichtouse-user`（search_path 已设）psql `-f` 应用。

## Ticket 后端

plane（workspace `intentmill`，项目 WHICHTOUSE）。所有 ticket 操作经 n-plane 的 `scripts/plane.sh`；token 在 `~/.zshrc` 的 `$PLANE_ACCESS_TOKEN`（Bash 非交互 shell 需先 `source ~/.zshrc`）。

---

# 相关 evodocs 模块

> 注意：下面这份 ingest-pipeline 模块文档已经过时——它描述的是 Phase 1 的三轨道 ingest skill 与 `resources/content/wt-sources.json`，
> 而本工单要改的是当前的每日刷新任务 `app/jobs/refresh.mjs` 与 `app/src/content/sources.json`。
> 它仍值得读的地方是 known-limits 一节，其中已预先记下本工单要解决的失效模式。

# purpose

The ingest pipeline is a repository-local agent skill and deterministic script suite for discovering agent products, collecting native popularity signals, writing provisional candidates to PostgreSQL, recomputing category rankings, and exporting machine-readable static files. It represents the original Phase 1 three-track data path and remains operationally significant even though the current web interface reads a separate version-controlled catalog.

# structure

The skill contract defines the boundary between semantic agent judgment and scripts. Scripts own API calls, signal math, deduplication, database writes, ranking SQL, and file generation. The host agent owns ambiguous category/form-factor decisions and adjustments to category keywords or seed sources when a track is thin.

The ingest orchestrator loads category configuration, limits each track to a small candidate set, and processes categories sequentially. GitHub discovery has a general repository search and a dedicated skill/MCP search. App discovery uses the public aiagentsdirectory API as a seed source rather than a database mirror.

The database adapter owns lazy PostgreSQL access to `whichtouse-schema`, category lookup, conflict-aware item upsert, and connection shutdown. The ranking script performs full replacement inside one transaction. The static exporter reads categories and rankings and writes `llms.txt`, a category index, and one JSON document per category under the app's public assets.

# flows

For each configured category, the orchestrator first confirms that the category exists in PostgreSQL. It searches GitHub using bounded keyword sets, separates a precision-oriented MCP/skill candidate set from general repositories, and excludes skill URLs from the repository track. GitHub stars become the overall signal; stars divided by repository age in months become the current growth proxy.

App candidates are fetched once from aiagentsdirectory, matched against terms derived from category keywords and names, filtered to remove clearly open-source entries, ordered by upvotes, and limited. Upvotes become the overall signal and age-normalized upvotes become growth.

Every item is written with a provisional badge. Repository URLs are deduplication keys for code tracks; app records use the homepage domain where possible. A conflict on category and deduplication key updates the existing record, including its form factor and signals.

Ranking deletes the current ranking set and rebuilds it atomically. Each category/form-factor partition receives up to ten overall entries and five growth entries. Best 3 selects the top item from each form factor, normalizes its signal against the maximum in that track, and orders the winners within the category.

Static export reconstructs overall, growth, and Best 3 collections and writes public JSON plus an `llms.txt` index. These files are snapshots and change only when the exporter runs.

# module-relationships

The pipeline depends on `resources/content/wt-sources.json`, the PostgreSQL schema under `ssot-schemas`, GitHub search/API behavior, the local `gh auth token`, and aiagentsdirectory's public response shape. It writes production-like project data and therefore must follow credential and redline discipline.

Its generated public files are served by the web container, but the current catalog UI does not query the rankings tables or these three-track JSON files. `web-app/catalog` instead bundles authored two-track JSON. Treat synchronization between these models as absent unless a ticket explicitly introduces a bridge.

The enrichment workflow targets authored category JSON and does not enrich PostgreSQL items. Both skills influence ranking content, but they operate on different stores and contracts.

# constraints

Discovery must aggregate small top-N slices and may not mirror a competitor's full database. Product Hunt commercial use and blocked scraping sources remain outside the automated path.

Credentials must come from environment variables or the local GitHub CLI and must never be embedded in code or command output. Database connections must keep the project schema search path.

All acquired records remain provisional. Growth is an age-normalized proxy, not a measured thirty-day delta, despite older comments and configuration labels that mention last-30-day growth.

Ranking replacement must remain transactional so readers never observe a partially rebuilt set. Deduplication must preserve one category/form-factor identity per canonical product key.

# known-limits

The skill is manual and has no scheduler. Per-category failures are logged and skipped, which allows partial ingestion to finish without a failing process status. Dedicated skill discovery requires `mcp` in the repository name, so it excludes many genuine agent skills and can include MCP servers despite the current catalog's preference for packaged skills.

The aiagentsdirectory adapter assumes a flexible but undocumented response shape and performs broad text matching. GitHub search and unaudited age-normalized velocity can favor old or ambiguously categorized repositories.

The PostgreSQL model has three tracks and signal rankings, while the current site uses two authored tracks with rich evidence fields. Running ingest and rank alone does not update the visible catalog.

# notes-for-ai

Before running the pipeline, confirm database credentials, schema state, source configuration, and whether production writes are authorized. Test a single category before a full run and inspect track overlap and category fit rather than trusting keyword matches.

When changing ranking SQL, verify partition sizes, deterministic tie-breaking, Best 3 coverage, and transaction rollback. When changing discovery, preserve top-N compliance and explicit provisional labeling. Do not assume generated static files or database rows feed the current UI without tracing the catalog path.
