const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IDS = ["kvmini", "snipscribe", "moviebox", "tupu", "idphoto", "lifetree", "promptledger"];
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

for (const id of IDS) {
  assert.ok(html.includes('"' + id + '"'), "后台缺少产品 " + id);
}
assert.ok(html.includes("PRODUCTS"), "后台应有产品主数据常量");
assert.ok(html.includes("traffic/views"), "后台应读取网站访客数据");
assert.ok(html.includes("/policy/"), "后台设置应按产品写策略文件");

console.log("products.js: ok");
