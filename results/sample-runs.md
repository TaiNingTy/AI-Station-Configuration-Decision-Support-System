# Sample Runs — Real Outputs (2026-08-15)

Actual outputs from the deployed Coze agentic-workflow bot (豆包 2.0 pro).
Two test cases, each showcasing a different capability.

**Full verbatim traces:** [`tc1-greenfield-raw.md`](tc1-greenfield-raw.md) · [`tc2-central-hub-raw.md`](tc2-central-hub-raw.md)

> **KB v1.1 note:** the single-space capacity constant was corrected (120 → 300 pax/h) so the rule set is internally consistent. TC1 below is the **real re-run output** on the updated KB (2026-08-16). TC2 is unaffected (its blocker is the curve radius) and shows its original raw output.

---

## TC1 — Greenfield Line (compliant → grounded validation)

**Input (site_info):**
> Suburban commuter feeder station, 5,000-household new residential district + 1 middle school. Peak flow ~500 pax/h. Strip site 6m×35m along an arterial. Low-lying ground with rainy-season flooding history. Grid power 300m away. Owner: cost-controlled, cover peak, accessible.

### Agent 1 — Requirement Analysis (excerpt)
```json
{ "station_grade": "B", "peak_flow_per_hour": 500,
  "land_width_m": 6, "land_length_m": 35,
  "key_constraints": ["低洼积水", "市电300m外", "带状用地"] }
```

### Agent 2 — Retrieval + Rule Evaluation (real output, KB v1.1)
Grounded compliance check — sources trace to `KB_01` / `KB_02`, no fabrication:
```json
{
  "compliance_check": [
    {"item":"站点分级匹配","status":"合规","detail":"500人/h 属 B 级区间(200-600)，1–2 月台即可"},
    {"item":"用地规模适配","status":"合规","detail":"6m×35m 可布侧式站台(净宽≥2.5m)+候车区≥15㎡"},
    {"item":"无障碍设施","status":"合规","detail":"B 级仅需坡道/盲道/高差达标，无需电梯"},
    {"item":"供电接入距离","status":"知识库未覆盖","detail":"KB 未规定市电接入距离限值"}
  ],
  "risks": [
    {"risk":"雨季积水/湿滑","severity":"中","mitigation":"抬高地坪 >30cm + 排水沟"},
    {"risk":"300m 市电压降/成本超支","severity":"中","mitigation":"核算线径与敷设成本"}
  ],
  "similar_cases": []
}
```
> Correctly grades **B (no false "upgrade to A")**, attributes to `KB_01`/`KB_02`, and honestly marks *"not covered"* where no rule exists. The KB_04 historical-case retrieval is **intermittent** (empty this run; it surfaced in other runs) — a known retrieval-coverage limitation, noted as future work (per-chunk metadata / case-retrieval routing).

### Agent 3 — Configuration + Documentation (real output)
A full Markdown delivery doc for a **compliant B-grade** station: a config table (side platform net width 2.5m / 100% canopy / accessibility ramp 7% / 20 bike spaces) with **KB citations + confidence scores**; a human-review risk table (drainage, 300m grid-power, KB-not-covered items → joint expert review); a staged checklist (design → construction → acceptance); and design rationale (side-platform choice, cost control — **no A-grade upgrade, no elevator needed**).

---

## TC2 — Central Hub (hard constraint → "not feasible", deferred to human) ⭐

**Input (site_info):**
> Downtown two-line interchange. Peak ~1,800 pax/h. Proposed platform sits on a **curve, radius ~27m**. Ample land. Owner: smooth transfer, all-weather waiting, accessible.

### Agent 1 — Requirement Analysis
```json
{ "station_grade": "S", "peak_flow_per_hour": 1800,
  "key_constraints": ["拟设站台处线路为曲线，半径约27m"] }
```

### Agent 2 — Retrieval + Rule Evaluation (the showcase)
```json
{
  "matched_rules": [{
    "rule": "曲线站台设置工程要求", "source": "KB_02 工程约束",
    "requirement": "站台设在曲线半径<30m时停靠精度不达标，不可实施"
  }],
  "compliance_check": [{
    "item": "曲线站台半径", "status": "不合规",
    "detail": "曲线半径27m < 规范≥30m，不符合工程约束"
  }],
  "risks": [{
    "risk": "曲线半径不达标，停靠精度不达标，项目无法实施",
    "severity": "高",
    "mitigation": "调整线位将曲线半径提升至≥30m，或改直线段"
  }],
  "similar_cases": ["城区两线换乘枢纽：原曲线半径28m不达标，调整线位至35m后通过"]
}
```

**Why this matters:** the system did **not** hallucinate a workable plan. It recognized a
hard engineering constraint (radius < 30m → not implementable), flagged severity = high,
proposed the correct fix (re-align to ≥30m), and surfaced an analogous precedent —
then handed the decision back to a human. This is the core thesis of the product:
**an AI that knows its boundary and when to defer.**
