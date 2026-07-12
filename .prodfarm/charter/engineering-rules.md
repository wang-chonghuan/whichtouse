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
- **复用 stemrobin**：架构与设计系统尽量复用（TanStack Start + Tailwind 设计令牌见 `resources/reference/DESIGN.md`）。
- **git**：主分支保护；改动走工单对应的 worktree（n-im 驱动）。

## 数据采集纪律（Phase 2 起）

多源汇编 + 自有打分，**不拖库、不镜像单一竞品库**；优先官方 API；封 bot 的源走其官方 API 或不用。详见 `architecture.md`。
