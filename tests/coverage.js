// 事件名必须都有中文说明：后台靠 labels.js 把 kind / 功能名翻成人话。
// 新增埋点后如果忘了在 labels.js 里登记，这里会失败（页面上会露出英文事件名）。
//
//   node tests/coverage.js
const assert = require("assert");
const L = require("../labels.js");

// 两个应用当前埋的全部事件名（新增埋点时同步加到这里和 labels.js）
const KINDS = ["app_start", "first_launch", "daily_active", "feature_used", "connected", "first_connected",
  "disconnected", "connect_failed", "version_mismatch", "setting_changed", "drag_failed", "update_installed",
  "update_failed", "internal_error", "permission_missing", "session_start", "session_end", "first_value",
  "deskpet_toggle", "pet_style", "pet_char_set", "view_mode", "hook_set"];
const FEATURES = ["edge_switch", "hotkey_switch", "preempt", "clipboard_sync", "file_send", "drag_drop",
  "keyboard_follow_toggle", "pause", "scan", "feedback", "pet_tap", "island_open"];
const METRICS = ["devices", "active7", "active30", "events"];

KINDS.forEach(function (k) {
  const t = L.kind(k);
  assert.ok(t[0] !== k, `事件 ${k} 没有中文名`);
  assert.ok(t[1].length > 0, `事件 ${k} 缺一句话说明`);
});
FEATURES.forEach(function (f) {
  const t = L.feature(f);
  assert.ok(t[0] !== f, `功能 ${f} 没有中文名`);
  assert.ok(t[1].length > 0, `功能 ${f} 缺一句话说明`);
});
METRICS.forEach(function (m) {
  assert.ok(L.metric(m)[1].length > 0, `指标 ${m} 缺说明`);
});

// 没登记的事件要原样返回英文，而不是报错或空白
assert.deepStrictEqual(L.kind("some_new_event"), ["some_new_event", ""]);

console.log(`覆盖 ${KINDS.length} 个事件 + ${FEATURES.length} 个功能 + ${METRICS.length} 个指标，全部有中文说明`);
