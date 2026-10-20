// 与 release-site/stats.py 对拍：同一批事件，两边聚合结果必须完全一致。
//   node tests/parity.js /path/to/release-site
const { execFileSync } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const Stats = require("../stats.js");

const site = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pa-parity-"));
const T0 = Date.UTC(2026, 9, 20, 4, 0, 0) / 1000;   // 2026-10-20 12:00 北京
const ev = (iid, o) => Object.assign({ app: "PromptLedger", install_id: iid, kind: "app_start", app_version: "0.5.0", os: "macos", ts: T0 }, o);
const events = [
  ev("a"), ev("a", { ts: T0 - 86400 }), ev("b", { ts: T0 - 5 * 86400, app_version: "0.4.0" }),
  ev("c", { ts: T0 - 20 * 86400, os: "windows" }), ev("d", { ts: T0 - 40 * 86400 }),
  ev("a", { kind: "panel_open" }), ev("x", { app: "KVMini" }), ev("t", { kind: "setup_test" }),
  ev("e", { ts: T0 - 3600 * 13, app_version: "0.10.0" }),           // 跨北京时间零点
];
fs.mkdirSync(path.join(dir, "PromptLedger"));
fs.mkdirSync(path.join(dir, "KVMini"));
fs.writeFileSync(path.join(dir, "PromptLedger", "2026-10.jsonl"),
  events.filter(e => e.app === "PromptLedger").map(e => JSON.stringify(e)).join("\n") + "\nnot json\n");
fs.writeFileSync(path.join(dir, "KVMini", "2026-10.jsonl"), events.filter(e => e.app === "KVMini").map(e => JSON.stringify(e)).join("\n"));

const py = execFileSync("python3", ["-c", `
import sys, json, datetime
sys.path.insert(0, ${JSON.stringify(site)})
import stats
print(json.dumps(stats.aggregate(stats.load_events(${JSON.stringify(dir)}), datetime.date(2026, 10, 20)), sort_keys=True))
`]).toString();

let js = [];
for (const app of fs.readdirSync(dir)) for (const f of fs.readdirSync(path.join(dir, app)))
  js = js.concat(Stats.parseLines(fs.readFileSync(path.join(dir, app, f), "utf8")));
const out = JSON.stringify(JSON.parse(JSON.stringify(Stats.aggregate(js, "2026-10-20"))), Object.keys).length;
const a = JSON.parse(py), b = Stats.aggregate(js, "2026-10-20");
const norm = o => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v)) ? Object.fromEntries(Object.entries(v).sort()) : v);
if (norm(a) !== norm(b)) {
  console.error("不一致\npython:", norm(a), "\njs:    ", norm(b));
  process.exit(1);
}
console.log("对拍通过：", b.apps.map(x => `${x.name} 设备 ${x.devices} / 7日 ${x.active7} / 30日 ${x.active30} / 事件 ${x.events}`).join("；"), out > 0 ? "" : "");
