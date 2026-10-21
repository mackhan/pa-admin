// 事件名 → 中文。统计里只有英文事件名（如 connected / feature_used），
// 后台在这里统一翻译成人话，并补一句「这条是什么意思」。
//
// 结构：[中文名, 一句话说明]
// 没收录的事件：原样显示英文事件名，说明留空 —— 看到英文就说明这里有新埋点没登记。
(function () {
  "use strict";

  // ── 事件（kind）───────────────────────────────────────────────────────────
  var KIND = {
    // 所有应用共用（SDK 记录）
    app_start: ["启动应用", "每次打开应用记一次"],
    first_launch: ["首次安装", "这台设备第一次打开应用，只记一次"],
    daily_active: ["当日活跃", "一天记一次，附带当天开着哪些功能"],
    feature_used: ["用了某个功能", "每个功能每天最多记一次，用来看哪些功能真有人用"],

    // KVMini
    connected: ["连上对端", "和另一台电脑连上了，带对方是什么系统"],
    first_connected: ["首次连接成功", "这台设备第一次连上另一台电脑"],
    disconnected: ["断开连接", "带这次连了多久、切换了几次控制权"],
    connect_failed: ["连接失败", "只记失败原因（超时 / 被拒 / 证书不符等），不记对方的 IP"],
    version_mismatch: ["版本不一致", "两端版本不同，按设计连不上"],
    setting_changed: ["改了设置", "只记改的是哪一项，不记具体值"],
    drag_failed: ["跨屏拖拽失败", "拖文件到另一台电脑没成功"],
    update_installed: ["自动更新成功", "新版下载并安装完成"],
    update_failed: ["自动更新失败", "下载或安装没成功"],
    internal_error: ["内部出错", "程序内部出错已写入日志，这里只记次数"],
    permission_missing: ["缺少系统权限", "macOS 的辅助功能 / 输入监控没授权"],

    // PromptLedger
    session_start: ["开始一次会话", "打开并开始记录一轮对话"],
    session_end: ["结束一次会话", "带这次持续了多少秒"],
    first_value: ["第一次看到自己的用量", "用户第一次真的看到「今天用了多少」，即 aha 时刻"],
    deskpet_toggle: ["开关桌宠", "打开或关闭桌面宠物"],
    pet_style: ["换桌宠样式", "切换桌宠的外观"],
    pet_char_set: ["换桌宠角色", "切换桌宠的角色组合"],
    view_mode: ["切换显示位置", "在菜单栏和独立窗口之间切换"],
    hook_set: ["接入 AI 客户端", "是否成功挂上某个 AI 客户端"]
  };

  // ── 功能名（feature_used 的 props.name）────────────────────────────────────
  var FEATURE = {
    // KVMini
    edge_switch: ["鼠标到边缘切换", "把鼠标推到屏幕边缘切到另一台电脑"],
    hotkey_switch: ["快捷键切换", "按全局快捷键切换控制权"],
    preempt: ["本机抢回控制权", "被对方控制时，动一下本机鼠标键盘就切回来"],
    clipboard_sync: ["跨设备剪贴板", "这边复制，那边粘贴"],
    file_send: ["自动传文件", "复制文件后自动送到另一台电脑"],
    drag_drop: ["拖文件跨屏", "把文件拖过屏幕边缘传过去"],
    keyboard_follow_toggle: ["双机键盘控制", "切换「键盘跟随光标」这个开关"],
    pause: ["暂停共享", "暂时停止键鼠共享"],
    scan: ["扫描局域网", "查找同一网络里的其他设备"],
    feedback: ["发反馈 / 看日志", "打开反馈邮件或日志目录"],

    // PromptLedger
    pet_tap: ["点桌宠", "点击桌面宠物"],
    island_open: ["打开灵动岛面板", "展开顶部的小面板"]
  };

  // ── 顶部四个数字 ──────────────────────────────────────────────────────────
  var METRIC = {
    devices: ["累计设备", "从有数据以来出现过的匿名编号总数。同一台设备重装、换 id 会算作新设备"],
    active7: ["7 日活跃", "最近 7 天里上报过事件的设备数"],
    active30: ["30 日活跃", "最近 30 天里上报过事件的设备数"],
    events: ["事件总数", "这一版累计收到的事件条数"]
  };

  // ── 连接失败的原因（KVMini 的 props.reason）───────────────────────────────
  var REASON = {
    refused: "对方没开 / 拒接",
    timeout: "连不上，超时",
    unreachable: "网络不通",
    tls: "证书校验没过",
    version: "两端版本不一致",
    unknown: "其他原因"
  };

  function lookup(dict, key) {
    return dict[key] || [key, ""];
  }

  var api = {
    kind: function (k) { return lookup(KIND, k); },
    feature: function (k) { return lookup(FEATURE, k); },
    metric: function (k) { return lookup(METRIC, k); },
    reason: function (k) { return REASON[k] || k; },
    // 给「查看全部说明」用
    all: function () { return { kind: KIND, feature: FEATURE, metric: METRIC }; }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.Labels = api;
})();
