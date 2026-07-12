# 0002 · tkt · D1 DB 基座 (WHICHTOUSE-3)

- 日期：2026-07-12
- 类型：tkt（enabler）
- batch：0001-phase1-mvp
- 交付：
  - `ssot-schemas/db-schemas/whichtouse.sql`：categories / items / rankings 三表（form_factor 轨道、overall+growth 信号、provisional 徽章、best3 排名）。
  - 按 easyapp 标准 provision：role `whichtouse-user` + schema `whichtouse-schema`（派生密码，.pgpass，防火墙加本机 IP）；三表已建（psql 验证）。
  - 注入 `DATABASE_URL`/`DATABASE_SCHEMA` 到 `ca-whichtouse`（provisioningState Succeeded）。
- 验收：三表存在（psql 验证）+ 项目用户端到端连通 + 容器 env 就位。
- 解 Gap Register #1（PG role/schema 未 provision）。
