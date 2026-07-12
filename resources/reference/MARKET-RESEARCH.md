# 市场调研报告（Market Research / prodfarm cap12）

> 日期：2026-07-12 ｜ 配套：PRODUCT-GOAL.md
> 方法：4 路并行调研（爬取数据源 / app-SaaS 排名信号 / 竞争空白+affiliate / 分发渠道），实测 API、robots.txt、ToS。
> 注意：部分 2026 数字来自二手 SEO 博客，落地前以官方帮助页为准（已附 URL）。

---

## 执行摘要

四件事都有了明确答案：

1. **竞争空白真实存在**：没人做全"三形态统一 + 业务用途 + 真实实测 + 综合 Best 3"。最接近的 aiagentsdirectory 差三样（无 skill 形态、不实测、无可信 Best 3）。
2. **爬取数据源可行，但有法务边界**：GitHub API + 官方 MCP Registry + Glama + aiagentsdirectory 的官方 `/api` + skills.sh 构成干净主干；但多个源的 robots **点名封 ClaudeBot/GPTBot**，Product Hunt **默认禁商用**——"内部分析"可以，"把爬来的数据原样搬上公开站"是另一回事。
3. **排名信号起步全免费**：流量用 Cloudflare Radar + Tranco 名次、融资靠新闻半自动、口碑用 Product Hunt API。
4. **平台不给钱、只引流**：自有资产落点是 beehiiv newsletter（0 抽成、Stripe 收美元、有 API）；自动跨发走 dev.to + Hashnode（canonical 回指）；X 只做有机分发；Medium 对 AI 内容最狠；中文只用知乎+掘金做 SEO，不碰提现。

**贯穿性洞察（最重要）：把四路拼起来，你的"真实测评"不只是差异化护城河——它同时解掉了三个独立难题**（见 §6）：内容侧的 AI 检测封杀、数据侧的爬取 ToS、产品侧的可信度。这三件事本来是三个坑，"人在环的真测 + 编辑化转写"一招同时填。

---

## 1. 爬取数据源（内部分析用）

### 推荐接入栈（按 字段丰富度 × 成本 × 法务安全）

| 优先级 | 源 | 入口 | 为什么 |
|---|---|---|---|
| ★1 主干 | **GitHub API + awesome 列表** | `api.github.com`（认证 5000/hr）+ VoltAgent/Composio 的 README 作策展种子 | 唯一"结构化 + 法务干净（公开 repo、多为 MIT/CC）+ 覆盖开源长尾"的主干。star/topics/license/描述一次拿全。**去重以 repo URL 为主键**（skills.sh/SkillsMP/awesome 本质都是 GitHub 再索引） |
| ★1 MCP 基准 | **官方 MCP Registry** | `registry.modelcontextprotocol.io/v0/servers`（免认证、cursor 分页） | 官方、为程序化消费而生、法务最干净 |
| ★2 MCP 富化 | **Glama** | `glama.ai/api/mcp/v1/servers`（免认证）｜**Smithery** `api.smithery.ai/servers`（免费 key，含 useCount 安装量） | 完整 config schema + 热度。⚠️ Glama `ai-train=no`，限内部分析、控频 |
| ★2 商业 agent | **aiagentsdirectory** | `aiagentsdirectory.com/api/agents`（免认证、全量 JSON） | 字段最富：pricing/category/industry/useCases/upvotes/views/reviewCount。走官方 `/api`、低频；⚠️ Terms 禁"未授权采集"，别爬 HTML |
| ★2 skill 热度 | **skills.sh** | SSR + sitemap，直含安装数/star | robots 无 AI 限制，几乎零摩擦；聚焦 Claude skill 排名时最对口 |
| 富化/基准 | **MIT AI Agent Index** | Zenodo `records/19592546`（CC BY 4.0） | 全场**唯一明确授权 reuse**，但仅 30 条、45 字段/条，做质量基准 |

### 避开 / 降级
- **PulseMCP、aiagentslist**：robots 点名封 ClaudeBot/GPTBot → PulseMCP 只走其 keyed API，aiagentslist 数据浅+Cloudflare，降级。
- **mcp.so**：homepage 403 主动反爬 → 仅用 sitemap。
- **Product Hunt**：GraphQL API 优秀（votesCount/commentsCount），但**默认禁商用**，仅内部分析；公开上线前须邮件获授权。

### ⚠️ 法务红线（必须内化）
"内部非商用爬取分析" ≠ "把爬来的数据原样展示在公开排名站"。多个源禁 bot / 禁商用采集。**合规姿势**：① 优先用官方 API（GitHub / MCP Registry / Glama / aiagentsdirectory `/api` / Smithery）；② 把外部数据当**信号**喂进**我们自己的编辑排名**（转写、加实测、加评分），而非逐字转载它们的库；③ GitHub 公开 repo（许可宽松）作主干最安全。——这恰好和"我们加真测/编辑价值"的产品定位一致：我们不是搬运它们的库，是产出自己的评估。

---

## 2. app/SaaS 排名信号（无 star 那一层）

三信号起步全用免费近似，验证后再升级付费：

| 信号 | 起步（免费） | 后期（付费） |
|---|---|---|
| **流量** | Cloudflare Radar API + Tranco List（免费、官方、零反爬，取域名流行度**名次**；小众产品未上榜本身即信号） | SimilarWeb API（$500+/mo，绝对 UV） |
| **融资** | WebSearch/新闻聚合 + 官方博客半自动填字段（公开事件、零成本）；Tracxn Lite 补 | Crunchbase Pro（$49–99/mo；完整 API 要 Enterprise $50k+） |
| **口碑/评论** | **Product Hunt 官方免费 GraphQL API**（upvotes+评论数，对新 agent 覆盖最好） | G2 官方 Developer Portal（完整评论需成为 Partner） |

注：G2/Capterra/TrustRadius 有 10–30% 评论疑似 AI 生成，"评论数"作信号含噪。避免直接爬 G2/Capterra（Cloudflare + ToS）。

---

## 3. 竞争空白（确认真实）

现有玩家分三个互不重叠阵营，无一跨越形态：
- **阵营A 商业 agent 目录**：aiagentsdirectory（**最接近**：已按业务用途 + SaaS 与开源同框，78+ 类目/2600+ 条）、theaiagentindex（344 条，dataset-first）、aiagentslist。
- **阵营B 通用 AI 工具目录**：There's An AI For That、Futurepedia、Product Hunt、G2——纯商业工具、社区评分、不跨形态。
- **阵营C skill/MCP 单形态注册表**：Smithery、skills.sh、skillsdirectory——只收 skill/MCP，按技术类别非业务用途。

**最接近 = aiagentsdirectory，差三点（正是你的护城河）**：① 不纳入 skill/MCP 作为被排名的第三形态；② 只罗列不实测；③ 无每业务用途的实测综合 Best 3。

⚠️ **反向警示**：四要素无人做全，也可能因为"整合难 / 维护成本高"，而非没人想到。**实测方法论 + 更新机制是成败关键**，不是锦上添花。

---

## 4. affiliate 变现

**可作主变现，但只对商业 SaaS 层有效，且早期收入薄。**

- **优先押**（recurring + 长 cookie）：Writesonic（30%+，终身 recurring）、Jasper（25% 12 月）、Synthesia（20% 12 月）、ElevenLabs（22% 首年，走 PartnerStack）、Murf。
- **网络**：先注册 **PartnerStack**（AI SaaS 覆盖最广，publisher 端免费）+ **Impact** + **Reditus**；未进网络的走官网直申。
- **筛选硬标准**：≥20% recurring、cookie ≥30 天、打款门槛 <$100、审核 ≤7 天、提供对比表/demo 素材。
- **收入体感**：小站 ~$400–1000/年，中站 ~$2500–6000/年——**靠规模流量 + 高转化实测内容累积，早期很薄**。
- ⚠️ **编码类 agent（Cursor、Claude Code）普遍无 affiliate**；skill 与开源层基本无佣金 → 定位为引流层。

---

## 5. 分发渠道

**原则：平台是引流/SEO/品牌，不是收款；变现靠自有站。**

**起步三件套（英文）**：
1. **beehiiv 自有 newsletter** — 收款与受众核心：0 抽成、Stripe 直收美元、有 API。所有渠道最终往这里导邮箱。
2. **dev.to + Hashnode** — 免费、有 API、支持 `canonical_url` 回指自有站、开发者/AI 受众契合、SEO 友好。**自动跨发主力，风险最低。**
3. **X** — 有机分发与品牌，不指望分成。真人节奏，**链接放回复/bio 不放正文**（避 $0.20/链接帖成本 + 算法降权），用官方 OAuth 定时工具、不用脚本。

**慎做/暂缓**：Medium（AI 付费墙文直接踢出 Partner，除非人工深度改写 + 首段声明）、Substack（抽 10% + 无 API，不如 beehiiv）、Reddit/LinkedIn（只手动低频、不进自动化）。

**中文侧**：仅**知乎（搜索权威）+ 掘金（开发者）**做引流/SEO，真人实测口吻回链英文站；**不碰公众号/头条提现**（海外个人收款几乎死结，头条 AI 检测最狠）。

**管道一句话**：自有站(canonical 源) → 自动跨发 dev.to+Hashnode → beehiiv 收邮箱与美元 → X/知乎/掘金 做人工分发钩子。

---

## 6. 三条贯穿性战略结论

**结论一（最重要）：真测一招解三坑。** 你的内容是 AI 生成评测（Medium/头条封杀）、你的数据是爬来的（多源禁 bot/禁商用）、你的排名要可信（竞品都不测）。这三个坑指向同一个解：**人在环的真实测评 + 编辑化转写**——它让内容不是纯 AI（可发布）、让数据变成你自己的评估（不侵权）、让排名可信（差异化）。所以真测不是"可选加分项"，是**整个模型的承重墙**。

**结论二：信任层与变现层要分开经营。** 你最有测评公信力的品类（编码/agent/开源，你自己是重度用户）**恰恰没有 affiliate**；有 affiliate 的品类（写作/视频/语音 SaaS）你未必天天用。所以：**用编码/skill/开源品类拉权威和流量（不赚钱），用写作/视频/语音 SaaS 品类做 affiliate 变现**。内容组合要刻意配比，不能只做自己爱做的。

**结论三：合规姿势 = 官方 API + 编辑化转写 + GitHub 主干。** 别爬禁 bot 的站、别搬库；用官方 API 取信号，产出自己的评估。GitHub（公开 repo、宽松许可）是最安全的主干，也天然覆盖 skill/开源两个形态。

---

## 7. 对 PRODUCT-GOAL.md 的更新点

- §3.4/§6 排名信号**落实**：开源/skill=GitHub star+skills.sh/Smithery 安装量；app/SaaS=Cloudflare Radar/Tranco(流量)+新闻(融资)+Product Hunt(口碑)。
- §7 护城河**加一条**：真测是"承重墙"（解三坑），并入结论一。
- §8 商业模式**细化**："信任层/变现层分开"（结论二）；affiliate 优先押 recurring 长 cookie；先接 PartnerStack/Impact/Reditus。
- §10 技术架构**落实爬取管线**：GitHub API 主干 + MCP Registry + Glama + aiagentsdirectory `/api` + skills.sh；加**法务红线**（官方 API + 编辑化转写，不搬库）。
- §11 风险**加两条**：数据源 ToS/robots 合规；"信任品类无 affiliate、变现品类需另测"的内容配比风险。
- §13 分发**落实**：beehiiv + dev.to/Hashnode + X；Medium 慎用；中文只知乎+掘金。

---

## Sources（精选）
- 数据源：[官方 MCP Registry](https://registry.modelcontextprotocol.io/docs) · [Glama MCP API](https://glama.ai/mcp/reference) · [Smithery API](https://smithery.ai/docs/api-reference/servers/list-all-servers) · [GitHub REST 限流](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) · [MIT AI Agent Index (Zenodo, CC BY 4.0)](https://zenodo.org/records/19592546)
- 信号：[Tranco](https://tranco-list.eu/) · [Cloudflare Radar](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/) · [Product Hunt API](https://api.producthunt.com/v2/docs)
- affiliate：[PartnerStack](https://partnerstack.com) · [Reditus](https://getreditus.com) · [AI 工具最佳 affiliate（费率参考）](https://www.rewardful.com/articles/the-best-affiliate-programs-for-ai-tools)
- 分发：[beehiiv API](https://developers.beehiiv.com) · [dev.to API](https://developers.forem.com/api) · [Hashnode API](https://apidocs.hashnode.com) · [Medium AI 内容政策](https://help.medium.com/hc/en-us/articles/22576852947223-Artificial-Intelligence-AI-content-policy)
- 竞品：[aiagentsdirectory 类目](https://aiagentsdirectory.com/categories) · [theaiagentindex](https://theaiagentindex.com/)
