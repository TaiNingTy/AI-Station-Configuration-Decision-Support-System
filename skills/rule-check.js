// Skill · Deterministic Hard-Constraint Rule Check
// ---------------------------------------------------------------------------
// Encodes the non-negotiable engineering / accessibility rules from KB_02 §6.
// PASS/FAIL is decided HERE by code — the LLM only *explains* the verdict.
//
// Safety-system semantics (a missing input is NOT a pass):
//   PASS           value present and compliant
//   FAIL           value present and violates the rule  → BLOCKED
//   NOT_EVALUATED  value missing                        → NEEDS_REVIEW (never silently passes)
//   NOT_APPLICABLE rule does not apply to this case     → ignored by the gate
//
// Two phases, because the rules bind at different times:
//   evaluateSiteConstraints(requirement)     — before config (route geometry)
//   evaluateProposedConfiguration(proposal)  — after config (platform length, gap)
//
// Status: reference implementation. Deploys as a Coze Code node in V1.1
//         (see ../README.md#9-roadmap). Runnable as-is in Node for local testing.
// ---------------------------------------------------------------------------

const STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
  NOT_EVALUATED: "NOT_EVALUATED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

const SITE_RULES = [
  {
    id: "ENG-006",
    name: "Curve radius",
    source: "KB_02",
    field: "curve_radius_m",
    threshold_value: 30,
    severity: "critical",
    reason: "曲线半径 < 30m，停靠精度不达标，不可实施",
    // Only binds when the platform sits on a curve.
    applicable: (p) => p.platform_on_curve !== false, // false → N/A; null/true → evaluate
    compliant: (v) => v >= 30,
  },
];

const CONFIG_RULES = [
  {
    id: "ENG-002",
    name: "Straight platform length",
    source: "KB_02",
    field: "straight_platform_m",
    threshold_value: 8,
    severity: "critical",
    reason: "直线站台段 < 8m，无法停靠，方案不成立",
    applicable: () => true,
    compliant: (v) => v >= 8,
  },
  {
    id: "ACC-001",
    name: "Platform-to-floor height gap",
    source: "KB_02",
    field: "platform_gap_mm",
    threshold_value: 20,
    severity: "critical",
    reason: "月台与车辆地板高差 > 20mm 且无补偿装置，不满足无障碍，不可交付",
    applicable: () => true,
    compliant: (v, p) => v <= 20 || p.has_gap_compensation === true,
  },
];

function checkRule(rule, params) {
  const base = {
    rule_id: rule.id,
    name: rule.name,
    source: rule.source,
    severity: rule.severity,
    threshold_value: rule.threshold_value,
    actual_value: params[rule.field] ?? null,
  };

  if (rule.applicable(params) === false) {
    return { ...base, status: STATUS.NOT_APPLICABLE, reason: "规则不适用于本案例" };
  }
  if (params[rule.field] == null) {
    // Missing input must NOT auto-pass — it needs a human / more data.
    return { ...base, status: STATUS.NOT_EVALUATED, reason: `缺少字段 ${rule.field}，需补充后校验` };
  }
  const ok = rule.compliant(params[rule.field], params);
  return { ...base, status: ok ? STATUS.PASS : STATUS.FAIL, reason: ok ? "符合" : rule.reason };
}

function runRules(rules, params) {
  const results = rules.map((r) => checkRule(r, params));
  const anyFail = results.some((r) => r.status === STATUS.FAIL);
  const anyUneval = results.some((r) => r.status === STATUS.NOT_EVALUATED);
  const workflow_status = anyFail ? "BLOCKED" : anyUneval ? "NEEDS_REVIEW" : "PASS";
  return {
    workflow_status,
    // Gate contract: config generation may proceed ONLY on a clean PASS.
    allow_configuration: workflow_status === "PASS",
    results,
  };
}

const evaluateSiteConstraints = (requirement = {}) => runRules(SITE_RULES, requirement);
const evaluateProposedConfiguration = (proposal = {}) => runRules(CONFIG_RULES, proposal);

// --- Examples -------------------------------------------------------------
// TC2 · Central Hub (on a 27m curve):
//   evaluateSiteConstraints({ platform_on_curve: true, curve_radius_m: 27 })
//   → BLOCKED, allow_configuration: false, ENG-006 FAIL (actual 27, threshold 30)
//
// Missing radius (unknown geometry):
//   evaluateSiteConstraints({})
//   → NEEDS_REVIEW (ENG-006 NOT_EVALUATED) — does NOT pass
//
// Straight-line site (rule N/A):
//   evaluateSiteConstraints({ platform_on_curve: false })
//   → PASS (ENG-006 NOT_APPLICABLE)
//
// TC1 · Greenfield config:
//   evaluateProposedConfiguration({ straight_platform_m: 18, platform_gap_mm: 15 })
//   → PASS

module.exports = {
  STATUS,
  SITE_RULES,
  CONFIG_RULES,
  evaluateSiteConstraints,
  evaluateProposedConfiguration,
};
