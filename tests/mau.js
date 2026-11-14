const assert = require("assert");
const Stats = require("../stats.js");

const DAY = 86400;
const T0 = Date.UTC(2026, 10, 14, 4, 0, 0) / 1000;
function ev(iid, offset, extra) {
  return Object.assign({
    app: "KVMini", install_id: iid, kind: "app_start",
    app_version: "0.4.41", os: "macos", ts: T0 - offset * DAY,
  }, extra || {});
}

const events = [
  ev("a", 0), ev("a", 1), ev("a", 2),
  ev("b", 0, { os: "windows" }),
  ev("c", 20),
  ev("a", 40), ev("d", 40),
  ev("x", 0, { kind: "setup_test" }),
  ev("y", 0, { app: "PromptLedger" }),
];

assert.deepStrictEqual(Stats.monthlyActive(events, "KVMini"), { "2026-10": 3, "2026-11": 2 });
assert.deepStrictEqual(Stats.monthlyActive(events), { "2026-10": 3, "2026-11": 3 });
assert.deepStrictEqual(Stats.monthlyActive(events, "Other"), {});
assert.deepStrictEqual(Stats.monthlyActive([]), {});

console.log("mau.js: ok");
