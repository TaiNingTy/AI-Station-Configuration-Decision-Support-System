// Skill · Deterministic Hard-Constraint Rule Check
// ---------------------------------------------------------------------------
// Encodes the non-negotiable engineering / accessibility rules from KB_02 §6.
// PASS/FAIL is decided HERE by code — the LLM only *explains* the verdict, it
// never decides it. On any Critical FAIL the workflow is BLOCKED and downstream
// configuration generation must not run.
//
// Status: reference implementation. Deploys as a Coze Code node in V1.1
//         (see ../README.md#9-roadmap). Runnable as-is in Node for local testing.
// ---------------------------------------------------------------------------

const HARD_RULES = [
  {
    id: "ENG-006",
    name: "Curve radius",
    source: "KB_02",
    threshold: "curve_radius_m >= 30",
    severity: "critical",
    reason: "曲线半径 < 30m，停靠精度不达标，不可实施",
    check: (p) => p.curve_radius_m == null || p.curve_radius_m >= 30,
  },
  {
    id: "ENG-002",
    name: "Straight platform length",
    source: "KB_02",
    threshold: "straight_platform_m >= 8",
    severity: "critical",
    reason: "直线站台段 < 8m，无法停靠，方案不成立",
    check: (p) => p.straight_platform_m == null || p.straight_platform_m >= 8,
  },
  {
    id: "ACC-001",
    name: "Platform-to-floor height gap",
    source: "KB_02",
    threshold: "platform_gap_mm <= 20 (or compensation device)",
    severity: "critical",
    reason: "月台与车辆地板高差 > 20mm 且无补偿装置，不满足无障碍，不可交付",
    check: (p) =>
      p.platform_gap_mm == null ||
      p.platform_gap_mm <= 20 ||
      p.has_gap_compensation === true,
  },
];

/**
 * @param {object} params  e.g. { curve_radius_m, straight_platform_m, platform_gap_mm, has_gap_compensation }
 * @returns {{ workflow_status, passed, allow_configuration, failures }}
 */
function evaluate(params = {}) {
  const failures = HARD_RULES.filter((r) => !r.check(params)).map((r) => ({
    rule_id: r.id,
    name: r.name,
    source: r.source,
    status: "FAIL",
    severity: r.severity,
    threshold: r.threshold,
    reason: r.reason,
  }));

  const blocked = failures.some((f) => f.severity === "critical");

  return {
    workflow_status: blocked ? "BLOCKED" : "PASS",
    passed: failures.length === 0,
    // Gate contract: when false, Agent 3 must NOT generate a deliverable config.
    allow_configuration: !blocked,
    failures,
  };
}

// --- Examples -------------------------------------------------------------
// TC2 · Central Hub (curve radius 27m):
//   evaluate({ curve_radius_m: 27 })
//   → { workflow_status: "BLOCKED", allow_configuration: false,
//       failures: [{ rule_id: "ENG-006", status: "FAIL", ... }] }
//
// TC1 · Greenfield (no hard-constraint params):
//   evaluate({ straight_platform_m: 18 })
//   → { workflow_status: "PASS", allow_configuration: true, failures: [] }

module.exports = { evaluate, HARD_RULES };
