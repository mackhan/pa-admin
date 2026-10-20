# pa-admin · Atelier raIn 管理后台

地址：<https://mackhan.github.io/pa-admin/>（不出现在官网导航里，搜索引擎不收录）

## 做什么
- **使用统计**：各应用累计设备、7 / 30 日活跃、近 30 天每日活跃柱图、版本 / 系统 / 事件类型分布。只有聚合数字，没有任何安装 id。
- **权限管理**：谁能看后台 = 谁对私有数据仓 `mackhan/pa-stats` 有读权限；页面里直接增删协作者（GitHub 协作者邀请）。

## 为什么安全
- 本仓库是公开的，但**里面没有数据**：只有一个静态页面和统计脚本。
- 数据在私有仓 `mackhan/pa-stats`（由各应用的 tauri-commerce `analytics` 模块上报，`data/<应用>/<年-月>.jsonl`）。
- 登录 = 填一个 GitHub 令牌；浏览器直接调用 GitHub API 读私有仓并在本机计算，令牌只存本机 localStorage。
  没有仓库权限的令牌读不到任何东西。

## 令牌怎么办

| 需求 | Fine-grained 令牌设置 |
| --- | --- |
| 只看统计 | Repository access → Only select repositories → `mackhan/pa-stats`；Permissions → **Contents: Read-only** |
| 还能在页面里加人/删人 | 再加 **Administration: Read and write** |
| 用经典令牌（`ghp_…`） | 必须有 `repo` scope |

- **GitHub 只在创建那一刻显示一次令牌**，之后任何地方都看不到明文（页面只列名字、权限、过期时间）。
- 丢了就 Regenerate（同一个令牌名，权限不变）或删掉重建，然后重新登录一次后台。Regenerate 会立刻作废旧令牌，正在用它的地方都要换。
- 令牌在这台电脑的浏览器里会记住（localStorage）；登录后点右上角那个 `ghp_…abcd` 按钮可以**复制出来存到密码管理器**，点「退出」即从浏览器清除。
- 忘记了可以直接看本机 App 用的那个：`gh auth token`（PromptLedger 的上报令牌就存在 `~/.prompt-archive/settings.json` 的 `analytics_token`）。

## 登录时的自检

输入令牌后会逐项打勾/打叉，一眼看出卡在哪一层：
`令牌格式 → 令牌有效（并列出 scope） → 能看到私有仓 → 能读 data/ → 能否管协作者`。
打叉那行下面直接给出该改哪个开关。

## 开发
- `stats.js`：聚合逻辑，口径与 release-site 的 `stats.py` 一致；`node tests/parity.js <release-site 路径>` 两边对拍。
- `index.html` 里所有 GitHub 路径都要带 `repos/<owner>/<repo>` 前缀——少写前缀 GitHub 会 404 且不带 CORS 头，浏览器只报 `Failed to fetch`，很难查。
- 推到 `main` 即由 GitHub Pages 发布。

## 以后
账户体系（普通用户注册登录、我的授权、新版本订阅）方案见 release-site 的 `docs/账户与管理后台.md`；
上线后本后台并入账户后端，权限改由后端角色控制。
