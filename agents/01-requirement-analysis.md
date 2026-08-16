# Agent 1 · Requirement Analysis

**Role:** Parse the site brief into structured data and classify the station grade.
**Model:** Doubao 2.0 Pro
**Skills:** none (pure reasoning over the user input)
**When it runs (适用场景):** the user has provided site info and needs requirement analysis + grade classification.

## Input
`site_info` — free-text site brief (location, land size, peak flow, constraints, owner needs)

## Output — `requirement.json`
```json
{
  "project_name": "...",
  "location_type": "...",
  "scenario": "...",
  "peak_flow_per_hour": 0,
  "station_grade": "S | A | B | C",
  "land_width_m": 0,
  "land_length_m": 0,
  "key_constraints": [],
  "owner_requirements": []
}
```

## System prompt
```
你是站点项目的需求分析 Agent。根据用户提供的场地信息，提取关键需求并判断站点等级
(S>1500 / A 600-1500 / B 200-600 / C<200 人每小时)。
严格只输出 JSON，不要多余文字。输出 JSON 后，交接给「检索与规则校验」Agent 继续。
```

## Grade thresholds (KB_01)
| Grade | Scenario | Peak flow (pax/h) |
|---|---|---|
| S | hub / interchange | > 1500 |
| A | urban core | 600–1500 |
| B | urban general / commuter feeder | 200–600 |
| C | suburban terminal / low-frequency | < 200 |
