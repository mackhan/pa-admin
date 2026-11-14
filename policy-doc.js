(function (root) {
  "use strict";

  function unwrap(doc) {
    if (doc && doc.policy && typeof doc.policy === "object") return doc.policy;
    return doc || {};
  }

  function wrap(doc, patch, today) {
    var base = doc && typeof doc === "object" ? doc : {};
    var policy = Object.assign({}, unwrap(base), patch || {});
    policy.updatedAt = today || policy.updatedAt || "";
    return {
      revision: typeof base.revision === "number" ? base.revision : 1,
      product: base.product || "kvmini",
      policy: policy,
    };
  }

  var api = { unwrap: unwrap, wrap: wrap };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PolicyDoc = api;
})(this);
