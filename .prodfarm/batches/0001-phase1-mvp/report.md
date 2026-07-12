# Batch 0001 — Phase 1 MVP · 收尾报告

- seed：WHICHTOUSE-2 ｜ 状态：**done** ｜ 2026-07-12
- 线上：https://ca-whichtouse.kindsmoke-4d84c417.northeurope.azurecontainerapps.io/

## 交付总结（6/6 done）
| ref | ticket | 交付 |
|---|---|---|
| D1 | WHICHTOUSE-3 | DB 基座：whichtouse.sql 三表 + provision whichtouse-schema + DATABASE_URL |
| D2 | WHICHTOUSE-4 | 5 分类 + wt-sources.json（种子源/信号源） |
| D3 | WHICHTOUSE-5 | wt-ingest skill（目录发现 + 逐候选调查）→ 5类×3轨真实数据 |
| D4 | WHICHTOUSE-6 | rank.mjs：overall top10/轨 + growth top5/轨 + Best 3 |
| D5 | WHICHTOUSE-7 | 排名站 UI（分类列表 + 两维×三轨 + Best3，紧凑浅色），上线 |
| D6 | WHICHTOUSE-8 | AI 友好静态输出（llms.txt + /api/*.json），上线 |

**成果**：whichtouse.com 的 Phase 1 MVP 上线可用——按业务用途分类，每类 app/skill/repo 三轨各有整体最高 + 近一月增长最快榜 + 综合 Best 3，数据来自 GitHub/aiagentsdirectory 真实信号，全部 provisional，UI 紧凑诚实，并提供机读 llms.txt + JSON API。

## Proxy decisions（人类可事后否决的项）
1. **Best 3** = 每轨第一名跨形态并列，按类内归一化信号排序（覆盖三形态）。
2. **growth** = star/upvote 速度（signal/创建至今月数）代理，非真 30 天增量——因 GitHub stargazers 时间戳法不可靠（常 404 + 二级限流）。
3. **skill 轨精度** = 要求 repo 名含 "mcp"（滤掉通用大项目，反 slop）。
4. **单源/轨**（Phase 1）：repo/skill=GitHub、app=aiagentsdirectory；未接 Smithery/PH（无 key）。

## 已知 provisional / 待改进（非阻断）
- growth 是速度代理，非真 30 天窗口（Phase 2 可接 last30days）。
- 部分分类 skill 轨偏薄（真实反映生态，灵活条数）。
- 一次性 ingest（无 cron）；静态 AI 输出是构建期快照。
- 全站 provisional：signal 排名，尚未真测（Phase 3 才做动手评测）。

## Gap Register 增量
- Gap #1（PG 未 provision）：**已清除**（D1）。
- autoqa db 块 + db_adapter.py（cap2 遗留）：仍待，Phase 1 不阻断。
- 无新增 abort。
