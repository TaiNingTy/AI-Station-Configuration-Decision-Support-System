# Evals

A **runnable** eval suite for the deterministic rule gate — not just a rubric. It executes
[`../skills/rule-check.js`](../skills/rule-check.js) against [`test_cases.json`](test_cases.json)
and checks expected vs actual, with an exit code for CI.

```bash
node evals/run.js
```

Latest result (9/9 pass):

```
Site-geometry pre-check (evaluateSiteConstraints)
  [PASS] G-001 (hard-constraint) → BLOCKED
  [PASS] G-002 (pass) → PASS
  [PASS] G-003 (boundary) → PASS
  [PASS] G-004 (not-applicable) → PASS
  [PASS] G-005 (missing-data) → NEEDS_REVIEW
Post-config check (evaluateProposedConfiguration)
  [PASS] C-001 (hard-constraint) → BLOCKED
  [PASS] C-002 (pass) → PASS
  [PASS] C-003 (accessibility-fail) → BLOCKED
  [PASS] C-004 (accessibility-compensation) → PASS

9/9 passed.
```

Coverage: hard-constraint, pass, boundary (exactly at threshold), not-applicable, missing-data
(must **not** auto-pass), and accessibility with/without a compensation device.

**Scope:** this suite covers the **deterministic** layer (the part that must be provably correct).
The LLM layers (Agents 1–3) are evaluated qualitatively in [`../docs/evaluation.md`](../docs/evaluation.md);
running them programmatically needs the Coze workflow published as an API (see the Coze API wrapper — planned in `src/`).
