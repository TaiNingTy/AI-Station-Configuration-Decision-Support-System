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
| **1 · Requirement Analysis** | Parse the site brief, classify station grade (S/A/B/C) | `requirement.json` |
| **2 · Retrieval + Rule Evaluation** | Retrieve from the knowledge base, check compliance, flag risks — **KB-grounded, no fabrication** | `evaluation.json` |
| **3 · Configuration + Documentation** | Recommend config (value + basis + confidence), generate the delivery doc & checklist | `proposal.md` |

> Built as a deterministic pipeline rather than free autonomous hand-off — **controllability and evaluability** matter more than autonomy in an enterprise setting, and errors are easy to localize to a single agent.

## 4. Knowledge Engineering

Four curated documents ([`knowledge_base/`](knowledge_base/)) with a hierarchical structure so retrieval can cite the source section:

- `KB_01` Planning Guidelines · `KB_02` Engineering Standards · `KB_03` Station Rules · `KB_04` Historical Cases

Agent 2's retrieval is **auto-called** on every turn, hybrid search, low match threshold, reranked — so grounding is enforced, not optional.

## 5. Human Review

Three things are always routed back to a human: **final configuration, engineering feasibility, business/budget decisions.** The pipeline surfaces these explicitly at the top of the delivery doc (marked *"requires human decision"*) rather than deciding them.

> **Honest status (V1):** today this is a *human-review handoff* — the system flags what needs sign-off but does not yet hard-block downstream generation. A deterministic gate (block configuration generation on any Critical FAIL) is the next build step — see [Roadmap](#9-roadmap).

## 6. Demo — Two Test Cases

Full outputs in [`results/sample-runs.md`](results/sample-runs.md).

| Case | Input | What the system did |
|---|---|---|
| **TC1 · Greenfield** (compliant) | 500 pax/h, low-lying, B-grade | **Grounded validation + risk surfacing:** confirms B-grade capacity holds (500 ÷ 300 = 2 spaces, within the B-grade cap), flags the low-lying **drainage risk**, and reuses the analogous Riverside case from KB_04 — every citation traceable, nothing fabricated. |
| **TC2 · Central Hub** (hard) ⭐ | 1,800 pax/h, platform on a 27m-radius curve | **Hard-constraint catch:** radius 27m < 30m → *"not implementable."* Severity high, correct fix ("re-align to ≥30m"), and it surfaced a 28m→35m precedent — then **deferred to a human.** |

TC2 is the thesis in one screen: **the AI recognizes an infeasible plan and stops, instead of confidently hallucinating a solution.**

## 7. Evaluation

Five dimensions × grounded test cases — full rubric and scores in [`03_Evaluation.md`](03_Evaluation.md).
Dimensions: Recommendation Accuracy · Rule Compliance · Risk Identification · Document Quality · Human-in-the-Loop.

## 8. The RAG Problem I Solved (the most instructive part)

The first version of Agent 2 *looked* authoritative but was **hallucinating** — citing real-sounding national standards (GB/T, CJJ) and an invented case study, none of which were in the knowledge base.

- **Diagnosis:** citations didn't map to the KB and the "similar case" was fabricated → retrieval wasn't actually grounding.
- **Fix:** set retrieval to **auto-call**, dropped the match threshold to 0.15, raised recall to 10; and hardened the prompt to *only* cite the KB, forbid external standards, and write **"not covered by knowledge base"** when it couldn't find a basis.
- **Result:** every citation returned to `KB_0x`, honest "not covered" flags appeared, and all four KB documents contributed.

> **Product takeaway:** for a RAG product, the core metric isn't "can it answer" — it's **"will it admit when it doesn't know."** Trustworthiness beats completeness.

## 9. Roadmap

- **This repo — V1 public demo** ✅ Knowledge base + agentic-workflow rule validation + configuration recommendation + human-review handoff
- **Next (V1.1)** Deterministic rule node — code-enforced PASS/FAIL for hard constraints (LLM only *explains*, never decides) + a real block-on-Critical-FAIL gate
- **V2** GIS/CAD ingestion, demand prediction, site simulation
- **V3** Optimization engine, automated iteration

## 10. Repository Structure

```
├── README.md                     ← this case study
├── 00_Build_Playbook.md          how it was built on Coze, step by step
├── 01_Input_Sample.md            test-case inputs
├── 02_Agent_Prompts.md           the 3 agents' system prompts
├── 03_Evaluation.md              rubric + real measured results
├── 04_Demo_Script.md             5-minute demo narration + Q&A
├── knowledge_base/               KB_01–04 (the RAG source docs)
├── results/sample-runs.md        real TC1 / TC2 outputs
└── assets/                       architecture diagram (svg / png / pdf, + dark & theme-adaptive)
```

## 11. Reproduce It

Everything needed to rebuild the bot on Coze is here: upload `knowledge_base/` as a knowledge base, create a 3-agent workflow, paste the prompts from `02_Agent_Prompts.md`, wire the knowledge base to Agent 2, and test with `01_Input_Sample.md`. Full walkthrough in [`00_Build_Playbook.md`](00_Build_Playbook.md).

## 12. Configuration (single source of truth)

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
