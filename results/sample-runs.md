# Sample Runs — Real Outputs (2026-08-15)

Actual outputs from the deployed Coze multi-agent bot (豆包 2.0 pro).
Two test cases, each showcasing a different capability.

---

## TC1 — Greenfield Line (soft constraint → cross-rule reasoning)

**Input (site_info):**
> Suburban commuter feeder station, 5,000-household new residential district + 1 middle school. Peak flow ~500 pax/h. Strip site 6m×35m along an arterial. Low-lying ground with rainy-season flooding history. Grid power 300m away. Owner: cost-controlled, cover peak, accessible.

### Agent 1 — Requirement Analysis (excerpt)
```json
{ "station_grade": "B", "peak_flow_per_hour": 500,
  "land_width_m": 6, "land_length_m": 35,
  "key_constraints": ["低洼积水", "市电300m外", "带状用地"] }
```

### Agent 2 — Retrieval + Rule Evaluation (the key win)
The system found a **cross-rule conflict** entirely grounded in the KB:
```json
{
  "compliance_check": [{
    "item": "车位配置适配性", "status": "不合规",
    "detail": "500人/h 需5个车位；B级上限2 → 无法满足，需升级为A级设计"
  }],
  "similar_cases": ["案例A：郊区低洼居住区通勤站"]
}
```
> Every `source` traces to `KB_01/KB_02/KB_03`; historical case A (Riverside) retrieved from KB_04. No fabricated standards.

### Agent 3 — Configuration + Documentation (excerpt)
Produced a full Markdown delivery doc headed **`# 需人工决策`**, with a config table
(item / value / **basis** / **confidence**), a human-in-the-loop risk table
(grade upgrade + budget approval = high priority), a staged checklist, and design rationale.

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
