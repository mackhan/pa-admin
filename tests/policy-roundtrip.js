const assert = require("assert");
const { unwrap, wrap } = require("../policy-doc.js");

const doc = {
  revision: 3,
  product: "kvmini",
  policy: {
    schema: 1,
    updatedAt: "2026-11-14",
    force: { enabled: false, minVersion: "", graceDays: 0, notes: { zh: "", en: "" } },
    block: { belowVersion: "" },
    pricing: { mode: "free", notice: { zh: "", en: "" }, effectiveFrom: "" },
  },
};

assert.deepStrictEqual(unwrap(doc), doc.policy);

const next = wrap(doc, { force: Object.assign({}, doc.policy.force, { enabled: true }) }, "2026-11-15");
assert.strictEqual(next.revision, 3);
assert.strictEqual(next.product, "kvmini");
assert.strictEqual(next.policy.force.enabled, true);
assert.strictEqual(next.policy.updatedAt, "2026-11-15");
assert.strictEqual(next.policy.pricing.mode, "free");
assert.strictEqual(typeof next.policy.schema, "number");

const legacy = { schema: 1, force: { enabled: false } };
assert.deepStrictEqual(unwrap(legacy), legacy);
const fromLegacy = wrap(legacy, { force: { enabled: false } }, "2026-11-15");
assert.strictEqual(fromLegacy.revision, 1);
assert.strictEqual(typeof fromLegacy.product, "string");

console.log("policy-roundtrip.js: ok");
