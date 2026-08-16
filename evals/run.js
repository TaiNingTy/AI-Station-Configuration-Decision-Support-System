#!/usr/bin/env node
// Deterministic-gate eval runner.
// Runs evals/test_cases.json against skills/rule-check.js and checks expected vs actual.
// Usage:  node evals/run.js      (exit code 0 = all pass, 1 = any fail)

const fs = require("fs");
const path = require("path");
const {
  evaluateSiteConstraints,
  evaluateProposedConfiguration,
} = require("../skills/rule-check.js");

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "test_cases.json"), "utf8"));

let passed = 0;
let failed = 0;

function runSuite(name, list, fn) {
  console.log(`\n${name}`);
  for (const tc of list) {
    const out = fn(tc.input);
    const okStatus = out.workflow_status === tc.expect.workflow_status;
    const okAllow =
      tc.expect.allow_configuration === undefined ||
      out.allow_configuration === tc.expect.allow_configuration;
    const ok = okStatus && okAllow;
    ok ? passed++ : failed++;
    const mark = ok ? "PASS" : "FAIL";
    console.log(
      `  [${mark}] ${tc.id} (${tc.category}) → ${out.workflow_status}` +
        (ok ? "" : `  expected ${tc.expect.workflow_status}`)
    );
  }
}

runSuite("Site-geometry pre-check (evaluateSiteConstraints)", cases.site_constraints, evaluateSiteConstraints);
runSuite("Post-config check (evaluateProposedConfiguration)", cases.config_constraints, evaluateProposedConfiguration);

console.log(`\n${passed}/${passed + failed} passed.`);
process.exit(failed === 0 ? 0 : 1);
