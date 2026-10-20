// 埋点聚合（与 release-site/stats.py 同一套口径，tests/parity.js 逐项对拍）。
// 输入：事件数组 { app, install_id, kind, app_version, os, ts }；按北京时间切天；*_test 事件不算。
(function (root) {
  "use strict";
  var TZ = 8 * 3600;
  var FIELDS = ["app", "install_id", "kind", "app_version", "os", "ts"];

  function dayOf(ts) {                       // 北京时间的 YYYY-MM-DD
    var d = new Date((Number(ts) + TZ) * 1000);
    return d.toISOString().slice(0, 10);
  }
  function addDays(iso, n) {
    var d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function todayISO() { return dayOf(Date.now() / 1000); }
  function vkey(v) { return String(v).split("-")[0].split(".").map(function (x) { return /^\d+$/.test(x) ? +x : 0; }); }
  function cmpVer(a, b) {                    // 新版本在前
    var x = vkey(a), y = vkey(b);
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var d = (y[i] || 0) - (x[i] || 0);
      if (d) return d;
    }
    return 0;
  }
  function ranked(counter) {
    return Object.keys(counter).map(function (k) { return [k, counter[k]]; })
      .sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); });
  }

  // JSONL 文本 → 事件（脏行、字段不全、*_test 丢掉）
  function parseLines(text) {
    var out = [];
    String(text).split("\n").forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var e;
      try { e = JSON.parse(line); } catch (x) { return; }
      if (!e || typeof e !== "object" || FIELDS.some(function (k) { return !(k in e); })) return;
      if (/_test$/.test(String(e.kind))) return;
      out.push(e);
    });
    return out;
  }

  function aggregate(events, today, days) {
    today = today || todayISO();
    days = days || 30;
    var byApp = {};
    events.forEach(function (e) { (byApp[e.app] = byApp[e.app] || []).push(e); });
    var apps = Object.keys(byApp).map(function (name) {
      var es = byApp[name], lastSeen = {}, latest = {}, perDay = {}, kinds = {}, feats = {}, seenFeat = {};
      es.forEach(function (e) {
        var iid = e.install_id, ts = Number(e.ts), d = dayOf(ts);
        if (!lastSeen[iid] || d > lastSeen[iid]) lastSeen[iid] = d;
        if (!latest[iid] || ts >= latest[iid][0]) latest[iid] = [ts, String(e.app_version), String(e.os)];
        (perDay[d] = perDay[d] || {})[iid] = 1;
        kinds[e.kind] = (kinds[e.kind] || 0) + 1;
        // 功能使用：次数 + 用过的人（同一台机器只算一次）
        if (e.kind === "feature_used" && e.props && e.props.name) {
          var n = String(e.props.name);
          feats[n] = (feats[n] || 0) + 1;
          (seenFeat[n] = seenFeat[n] || {})[iid] = 1;
        }
      });
      function active(n) {
        var start = addDays(today, -(n - 1));
        return Object.keys(lastSeen).filter(function (k) { return lastSeen[k] >= start; }).length;
      }
      var versions = {}, oses = {};
      Object.keys(latest).forEach(function (k) {
        versions[latest[k][1]] = (versions[latest[k][1]] || 0) + 1;
        oses[latest[k][2]] = (oses[latest[k][2]] || 0) + 1;
      });
      var daily = [];
      for (var i = days - 1; i >= 0; i--) {
        var d = addDays(today, -i);
        daily.push([d, perDay[d] ? Object.keys(perDay[d]).length : 0]);
      }
      return {
        name: name, devices: Object.keys(lastSeen).length, active7: active(7), active30: active(30), events: es.length,
        versions: ranked(versions).sort(function (a, b) { return b[1] - a[1] || cmpVer(a[0], b[0]); }),
        os: ranked(oses), kinds: ranked(kinds), daily: daily,
        // 每项：[功能名, 次数, 用过几台设备]
        features: ranked(feats).map(function (r) { return [r[0], r[1], seenFeat[r[0]] ? Object.keys(seenFeat[r[0]]).length : 0]; }),
      };
    });
    apps.sort(function (a, b) { return b.devices - a.devices || (a.name < b.name ? -1 : 1); });
    return { generated: today, days: days, apps: apps };
  }

  var api = { parseLines: parseLines, aggregate: aggregate, dayOf: dayOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Stats = api;
})(this);
