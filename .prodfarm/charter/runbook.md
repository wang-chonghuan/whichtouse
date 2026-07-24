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
- **✅ 已 provision（D1/WHICHTOUSE-3）**：role `whichtouse-user`（派生密码）+ schema `whichtouse-schema` + 三表（categories/items/rankings，源 `ssot-schemas/db-schemas/whichtouse.sql`）已建；线上 `ca-whichtouse` 已注入 `DATABASE_URL`/`DATABASE_SCHEMA`。
- **本地连库**（开发/迁移用）：`.pgpass` 放 `pg-easyapp-shared...:5432:easyapp:whichtouse-user:<PGPASSWORD>`（600 权限），`PGPASSFILE=<路径> psql "host=pg-easyapp-shared.postgres.database.azure.com port=5432 dbname=easyapp user=whichtouse-user sslmode=require"`。**凭据只走 .pgpass/env-file，不进命令行明文，也不写进本 charter**。`<PGPASSWORD>` 获取方式：仓库根 `.env` 的 `EASYAPP_DATABASE_URL`（未提交），或线上 `az containerapp show -g rg-easyapp-shared -n ca-whichtouse` 的 `DATABASE_URL` 环境变量。本机 IP 需在 PG 防火墙（规则 `allow-wt-dev-*`）。
- 改 schema：编辑 `whichtouse.sql` → 以 admin 或 `whichtouse-user`（search_path 已设）psql `-f` 应用。

## Ticket 后端

plane（workspace `intentmill`，项目 WHICHTOUSE）。所有 ticket 操作经 n-plane 的 `scripts/plane.sh`；token 在 `~/.zshrc` 的 `$PLANE_ACCESS_TOKEN`（Bash 非交互 shell 需先 `source ~/.zshrc`）。
