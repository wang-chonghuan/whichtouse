# runbook.md — 运维手册（可直接执行，repo 根相对）

> 感知（实证验证）用它启动产品。密钥用占位符 + 获取方式表达。

## 开发 / 构建 / 测试

| 用途 | 命令 |
|---|---|
| 安装 | `cd app && npm ci` |
| 本地开发 | `cd app && npm run dev` |
| 构建 | `cd app && npm run build`（生成 `src/routeTree.gen.ts` + `.output/`） |
| 本地起生产 | `cd app && PORT=3000 node .output/server/index.mjs` → http://127.0.0.1:3000/ |
| 单测 | `cd app && npm test`（vitest） |
| E2E | `cd app && npm run e2e`（playwright） |

## 部署（n-easyapp）

- **线上**：https://ca-whichtouse.kindsmoke-4d84c417.northeurope.azurecontainerapps.io/
- Container App `ca-whichtouse` / `rg-easyapp-shared` / env `cae-easyapp-shared` / northeurope；镜像 `acreasyapp.azurecr.io/whichtouse:latest`；端口 3000；min/max replicas 1。
- **重部署**（既定路径，redlines 已为此路径豁免）：
  1. `cd whichtouse && az acr build --registry acreasyapp --image whichtouse:latest --file Dockerfile .`
  2. `az containerapp update -g rg-easyapp-shared -n ca-whichtouse --image acreasyapp.azurecr.io/whichtouse:latest`
  - 或走 **n-easyapp cap2**（redeploy-current-repo）。
- 前提：`az account show` 已登录（Sponsorship 订阅）。

## 数据库

- 共享 Azure PG `pg-easyapp-shared`，db `easyapp`，per-project schema `whichtouse-schema`，role `whichtouse-user`。连接经 `EASYAPP_DATABASE_URL`/`DATABASE_URL`（`app/src/lib/db.ts`）。
- **⚠️ Gap（见 Gap Register）**：PG role/schema **尚未创建**（MVP 不用 DB）。Phase 1 加 DB 功能时：以 admin 建 role+schema，再 `az containerapp update` 注入 `DATABASE_URL`/`DATABASE_SCHEMA`。admin 凭据在 n-easyapp 定值中，勿放命令行（用 .pgpass / 交互确认）。

## Ticket 后端

plane（workspace `intentmill`，项目 WHICHTOUSE）。所有 ticket 操作经 n-plane 的 `scripts/plane.sh`；token 在 `~/.zshrc` 的 `$PLANE_ACCESS_TOKEN`（Bash 非交互 shell 需先 `source ~/.zshrc`）。
