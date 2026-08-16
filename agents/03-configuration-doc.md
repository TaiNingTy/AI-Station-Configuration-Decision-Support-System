# Agent 3 · Configuration + Documentation

**Role:** Turn the requirement + evaluation into a delivery document — config with basis & confidence, plus human-review flags.
**Model:** Doubao 2.0 Pro
**Skills:** none
**When it runs (适用场景):** rule evaluation is done and a configuration + delivery document is needed.

## Input
`requirement.json` (from Agent 1) + `evaluation.json` (from Agent 2)

## Output — `proposal.md`
A Markdown delivery document:
1. **Summary**
2. **Configuration table** — item / recommended value / **basis (KB-cited)** / **confidence**
3. **Risks & human-review items** (human-in-the-loop)
4. **Delivery checklist** (design → construction → acceptance)
5. **Design rationale**

## System prompt
```
你是配置与文档 Agent。基于上文的结构化需求和校验结果，输出一份 Markdown 交付文档，含：
一、方案摘要；二、推荐配置表(配置项/推荐值/依据/置信度)；
三、风险与需人工确认事项(human-in-the-loop)；四、交付 Checklist；五、设计说明。
若有硬约束不满足，在文档顶部醒目标注「需人工决策」。
```

## Grounding boundary (important)
Agent 3 is the **generation** layer, not the grounding layer (that's Agent 2). Its config values fall into three kinds,
and V1.1 tags each row accordingly:
- **Rule-derived** — traceable to a KB rule (cite `KB_0x`).
- **Design-assumption** — a reasonable engineering default (e.g. cable gauge, platform length beyond the minimum, cost estimates) → **requires engineering calculation**, surfaced for human confirmation, *not* presented as a KB fact.
- **Human-required** — no basis available → `知识库未覆盖`, routed to a human.

The `confidence` column is a **self-reported evidence level (High/Medium/Low), not a calibrated probability** — a model-reported "100%" is not a real probability and should be read as "High evidence."

## Gate contract (V1.1)
If the `rule-check` skill returns `workflow_status: "BLOCKED"` (any Critical FAIL), this agent
**must not** generate a deliverable configuration — it outputs risks + remediation only, headed
**「需人工决策 / BLOCKED」**. Today this is enforced by prompt + human review; the hard block is the V1.1
deterministic gate (see [Roadmap](../README.md#9-roadmap)).
