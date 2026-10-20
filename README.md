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

## 开发
- `stats.js`：聚合逻辑，口径与 release-site 的 `stats.py` 一致；`node tests/parity.js <release-site 路径>` 两边对拍。
- 推到 `main` 即由 GitHub Pages 发布。

## 以后
账户体系（普通用户注册登录、我的授权、新版本订阅）方案见 release-site 的 `docs/账户与管理后台.md`；
上线后本后台并入账户后端，权限改由后端角色控制。
