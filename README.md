# AI Station Configuration & Decision Support System

**English** | [中文](README.zh-CN.md) · `Public Portfolio Demo V1`

> Turning fragmented transit-planning expertise into a **grounded, auditable AI workflow** — a controlled agentic workflow of three specialized LLM agents + RAG retrieval + a human-review handoff, which configures autonomous-transit stations and knows when to defer to a human.

**Role:** AI Product Manager (end-to-end: problem → agent design → knowledge engineering → evaluation)
**Platform:** Coze (agentic-workflow orchestration) + RAG knowledge base · **Model:** Doubao 2.0 Pro
**Pattern:** three specialized LLM agents in a fixed pipeline + a human-review handoff

> **Scope of this public demo:** a V1 reconstruction of the knowledge-retrieval, rule-validation, configuration-recommendation, and human-review portions of the workflow, using **synthetic data**. Spatial/GIS analysis, proprietary optimization logic, and regional rule packs are intentionally excluded — see [Roadmap](#9-roadmap).

<p align="center">
  <img src="assets/architecture_diagram.png" alt="Architecture" width="900">
</p>

---

## TL;DR

Station configuration knowledge at an autonomous-transit company lived in senior designers' heads and scattered documents — inconsistent standards, slow iteration. I turned it into a 3-agent AI pipeline that reads a site brief, checks it against a grounded knowledge base, and drafts a delivery document — **flagging any decision that must stay human**. Along the way I diagnosed and fixed a real RAG hallucination problem, which became the most instructive part of the build.

---

## 1. Problem

An autonomous public-transit company designs stations for three teams — **Operations, Engineering, Urban Design** — who each use different standards. The result:

- Knowledge is fragmented across people and documents
- Rules are interpreted manually, inconsistently
- Proposals iterate slowly; quality depends on which senior designer is available

## 2. AI Opportunity

> Not "build a chatbot." The real opportunity: **encode domain knowledge as an executable, auditable workflow.**

So the design centered on three things: **knowledge engineering**, **agent orchestration**, and the **AI-vs-human boundary**.

## 3. Solution — A 3-Agent Pipeline

```
Site brief
  → [1] Requirement Analysis   → structured requirement (JSON)
  → [2] Retrieval + Rule Eval  → grounded compliance + risks (JSON)   [Knowledge Base / RAG]
  → ── Human-review handoff ──
  → [3] Configuration + Docs   → delivery document (Markdown)
```

| Agent | Job | Output |
|---|---|---|
| **[1 · Requirement Analysis](agents/01-requirement-analysis.md)** | Parse the site brief, classify station grade (S/A/B/C) | `requirement.json` |
| **[2 · Retrieval + Rule Evaluation](agents/02-rule-evaluation.md)** | Retrieve from the knowledge base, check compliance, flag risks — **KB-grounded, no fabrication** | `evaluation.json` |
| **[3 · Configuration + Documentation](agents/03-configuration-doc.md)** | Recommend config (value + basis + confidence), generate the delivery doc & checklist | `proposal.md` |

Each agent's role, prompt, and I/O contract lives in [`agents/`](agents/); the capabilities they invoke are in [`skills/`](skills/).

> Built as a deterministic pipeline rather than free autonomous hand-off — **controllability and evaluability** matter more than autonomy in an enterprise setting, and errors are easy to localize to a single agent.

## 4. Knowledge Engineering

Four curated documents ([`knowledge_base/`](knowledge_base/)) with a hierarchical structure so retrieval can cite the source section:

- `KB_01` Planning Guidelines · `KB_02` Engineering Standards · `KB_03` Station Rules · `KB_04` Historical Cases

Agent 2's retrieval is **auto-called** on every turn, hybrid search, low match threshold, reranked — so grounding is enforced, not optional.

## 5. Human Review

Three things are always routed back to a human: **final configuration, engineering feasibility, business/budget decisions.** The pipeline surfaces these explicitly at the top of the delivery doc (marked *"requires human decision"*) rather than deciding them.

> **Status (V1.1, Phase A — verified):** a deterministic rule gate is now deployed as a Coze workflow — a code node decides PASS/FAIL and a conditional branch routes Critical FAILs away from the config path (verified: curve radius 27m → `BLOCKED`, 35m → `PASS`, straight-line → `PASS`). Wiring it in front of the config-generation agents — so a BLOCKED case never reaches Agent 3 — is Phase B. See [`docs/v1.1-rule-gate-plan.md`](docs/v1.1-rule-gate-plan.md).

## 6. Demo — Two Test Cases

Full outputs in [`results/sample-runs.md`](results/sample-runs.md).

| Case | Input | What the system did |
|---|---|---|
| **TC1 · Greenfield** (compliant) | 500 pax/h, low-lying, B-grade | **Grounded validation + risk surfacing:** confirms B-grade holds (500 in the 200–600 band; site fits a 2-space side platform), flags the low-lying **drainage** and 300m **power** risks, and produces a full delivery doc with KB-cited config + confidence scores — every citation traceable to KB_01/KB_02, nothing fabricated. |
| **TC2 · Central Hub** (hard) ⭐ | 1,800 pax/h, platform on a 27m-radius curve | **Hard-constraint catch:** radius 27m < 30m → *"not implementable."* Severity high, correct fix ("re-align to ≥30m"), and it surfaced a 28m→35m precedent — then **deferred to a human.** |

TC2 is the thesis in one screen: **the AI flags an infeasible plan and defers it to human review, instead of confidently hallucinating a solution.** (A code-enforced hard *block* on Critical FAIL is the V1.1 gate — see [Roadmap](#9-roadmap).)

## 7. Evaluation

Verifiable PASS/FAIL assertions (plus qualitative dimensions) — full detail in [`docs/evaluation.md`](docs/evaluation.md).
Dimensions: Recommendation Accuracy · Rule Compliance · Risk Identification · Document Quality · Human review.

## 8. The RAG Problem I Solved (the most instructive part)

The first version of Agent 2 *looked* authoritative but was **hallucinating** — citing real-sounding national standards (GB/T, CJJ) and an invented case study, none of which were in the knowledge base.

- **Diagnosis:** citations didn't map to the KB and the "similar case" was fabricated → retrieval wasn't actually grounding.
- **Fix:** set retrieval to **auto-call**, dropped the match threshold to 0.15, raised recall to 10; and hardened the prompt to *only* cite the KB, forbid external standards, and write **"not covered by knowledge base"** when it couldn't find a basis.
- **Result:** every citation returned to `KB_0x`, honest "not covered" flags appeared, and all four KB documents contributed.

> **Product takeaway:** for a RAG product, the core metric isn't "can it answer" — it's **"will it admit when it doesn't know."** Trustworthiness beats completeness.

## 9. Roadmap

- **This repo — V1 public demo** ✅ Knowledge base + agentic-workflow rule validation + configuration recommendation + human-review handoff
- **V1.1 · Phase A (done)** Deterministic rule gate deployed as a Coze workflow — code node decides PASS/FAIL, conditional branch blocks Critical FAILs (verified 27m→`BLOCKED` / 35m→`PASS`). Code: [`skills/rule-check.js`](skills/rule-check.js).
- **V1.1 · Phase B (next)** Wire the gate in front of the config-generation agents so a BLOCKED case never reaches Agent 3.
- **V2** GIS/CAD ingestion, demand prediction, site simulation
- **V3** Optimization engine, automated iteration

## 10. Repository Structure

```
├── README.md · README.zh-CN.md   ← this case study (EN / 中文)
├── agents/                       one spec per agent (role · prompt · I/O · skills)
│   ├── 01-requirement-analysis.md
│   ├── 02-rule-evaluation.md
│   └── 03-configuration-doc.md
├── skills/                       agent capabilities (no hollow entries)
│   ├── knowledge-retrieval.md    RAG grounding — active
│   └── rule-check.js             deterministic hard-constraint gate — reference impl → V1.1
├── knowledge_base/               KB_01–04 (the RAG source docs)
├── config/retrieval.yaml         model + retrieval config (single source of truth)
├── test-cases/inputs.md          test-case inputs
├── results/                      sample-runs.md + full raw traces (tc1 / tc2)
├── demo/                         run evidence (screenshots + video link) — capture in progress
├── docs/                         build-playbook · evaluation · demo-script · storyboard
└── assets/                       architecture diagram (svg / png / pdf, + dark & theme-adaptive)
```

## 11. Reproduce It

Everything needed to rebuild the bot on Coze is here: upload `knowledge_base/` as a knowledge base, create the three agents from [`agents/`](agents/), wire the [`knowledge-retrieval`](skills/knowledge-retrieval.md) skill to Agent 2, apply [`config/retrieval.yaml`](config/retrieval.yaml), and test with [`test-cases/inputs.md`](test-cases/inputs.md). Full walkthrough in [`docs/build-playbook.md`](docs/build-playbook.md).

## 12. Configuration (single source of truth)

Machine-readable: [`config/retrieval.yaml`](config/retrieval.yaml).

| Setting | Value |
|---|---|
| Model | Doubao 2.0 Pro |
| Retrieval mode | hybrid, **auto-called** every turn |
| Top-K recall | **10** |
| Match threshold | **0.15** |
| Rerank | on |
| KB version | `demo-v1.1` (single-space capacity = 300 pax/h) |
| Prompt version | `v1.1` (KB-only citation, external standards forbidden) |

---

*Résumé line:* Transformed complex transit-planning knowledge into standardized, AI-executable workflows — enabling reusable, auditable station-configuration capability across operations, engineering, and design teams.

*Note: knowledge-base content and agent prompts are in Chinese (built on Coze); this README and the case narrative are in English. Demo numbers are illustrative.*
