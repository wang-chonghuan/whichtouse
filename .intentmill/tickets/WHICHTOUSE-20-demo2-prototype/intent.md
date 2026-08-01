## Meta
- Type: story
- Batch: 无
- Origin: human
- Seed: 无

## Scope
用户可以在一个独立前端原型中浏览新的 WhichToUse 信息架构：首页展示站名、定位、全部分类和一个分类的完整榜单；分类页展示商业、开源、Skills·Agents 三种形态各自在位者与挑战者；工具详情页展示判断、适用性、成本和同类对照；全站索引页按分类列出全部工具，并且所有榜单条目通过站内链接进入工具详情页。

## Constraints
- 原型必须位于仓库根目录的 demo2 目录。
- 只实现前端和静态演示数据，不连接后端、数据库或外部 API。
- 所有界面必须由标准 Astryx 组件组成，并使用 Butter 主题；不得引入 Astryx 组件库和 Butter 主题之外的 UI 组件库或主题。
- 不得参考、复制或复用当前真实 app 的样式、布局实现、组件、CSS 或视觉资产。
- 页面范围固定为首页、分类页、工具详情页和全站索引页。

## Acceptance criteria
1. 访问原型后，用户可以通过可见导航在首页、任一分类页、任一工具详情页和全站索引页之间往返，且链接不会跳向官网。
2. 分类页在桌面端清晰呈现三种形态与在位者、挑战者两层，每格最多五个条目；不足五个时显示“本位置暂无达标项”。
3. 工具详情页完整展示工具身份与官网入口、适合与不适合对象、缺点和价格线索、同类对照；挑战者还显示其挑战对象及差异。
4. 原型在桌面和移动视口均可读、可操作，没有内容重叠或水平溢出。

## Live charter

### Product goal
WhichToUse is an honest, use-case-first ranking site that compares hosted apps, open-source repositories, and agent skills as separate choices. Its trust depends on clearly separating numerical aggregation from human review. The current phase is a public, compact website; untested rankings remain provisional.

### Redlines
Do not publish externally, create or delete cloud resources, perform destructive production-data writes, incur paid-service costs, mirror a competitor database, bypass bot restrictions, commercialize Product Hunt data, accept sponsored placement, or modify the product goal without human approval.

### Engineering rules
Think before coding, make the smallest sufficient change, keep the database schema as the data-contract source of truth, keep secrets server-only, verify by actually running the product, never fabricate evidence, avoid temporary degradation branches, and do not add or change dependencies when the existing stack can deliver the requirement.

### Architecture
The repository uses React 19 and the installed Astryx design system. The production app is separate from this task. The requested artifact is an independent, frontend-only prototype under demo2 and must not read production data or reuse production presentation code.

### Runbook
The production app normally runs on port 5200. This ticket must provide its own local frontend command and use a different available port so both can be inspected side by side. Browser verification is required.

## Relevant module facts
The production web app currently owns routing, catalog rendering, responsive navigation, detail pages, SEO, and deployment. Its visual implementation and components are explicitly outside this ticket. The existing catalog data model contains category-relative listings, but demo2 uses static representative data only. The frozen demo directory remains untouched.
