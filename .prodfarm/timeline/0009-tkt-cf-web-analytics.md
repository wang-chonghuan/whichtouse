# 0009 · tkt · 接入 Cloudflare Web Analytics 流量统计 (WHICHTOUSE-10)

- 日期：2026-07-25
- 类型：tkt（enabler）
- batch：无（单工单直通道 cap5 → 开发验证 → cap6）
- 起因：线上此前**没有任何流量统计**。三条路径都不通——apex A 记录是灰云 DNS-only（Azure 托管证书的前提），Cloudflare 代理层看不到请求，CF 后台流量面板对本域名为空；容器日志只有启动行；Container Apps 环境未配置 Log Analytics（`appLogsConfiguration.destination` 为 `null`）。
- 交付：
  - CF 账号下新建 Web Analytics（RUM）站点：`site_tag e6790854dee148a2a6c06b8f7ad418ed`，绑定 zone `whichtouse.com`，**`auto_install: false`**。
  - `app/src/routes/__root.tsx` 在 `<body>` 内加入延迟加载的 beacon `<script>`；site token 存于 `app/src/lib/seo.ts` 的 `CF_BEACON_TOKEN`。
- 设计决定：
  - **必须用手动 beacon**，不能用自动注入——自动注入依赖橙云代理，而 apex 必须保持灰云，否则 Azure 托管证书失效（见 runbook 域名章节）。
  - 无新增 npm 依赖（遵守无谓依赖铁律），用原生 script 标签。
  - 无 cookie、不采集个人身份信息 → 不产生同意横幅义务。
  - site token 是**公开站点标识符**，不是密钥，可以入库。
- 部署：ACR 构建（run `cg4w`）+ `az containerapp update --revision-suffix 63c75d1`，修订版 `ca-whichtouse--63c75d1`。
- 验收（线上实证）：
  1. 访问 https://whichtouse.com/ 后，`performance` 资源表中存在 `static.cloudflareinsights.com/beacon.min.js` 与 `cloudflareinsights.com/cdn-cgi/rum` 两条请求。
  2. CF GraphQL `rumPageloadEventsAdaptiveGroups` 查得 **3 次浏览**，路径 `/`、`/c/coding`、`/c/image-generation`，与实际访问逐条对应（数据约 1–2 分钟延迟）。
  3. 桌面 1280px 与移动 375px 下首页与分类页渲染、侧边栏、顶栏搜索均无变化，控制台无新增报错。
- 已知限制：beacon 只统计能执行 JS 的真实浏览器，**爬虫与 SEO 机器人不计入**；抓取侧数据需另接 Google Search Console。
