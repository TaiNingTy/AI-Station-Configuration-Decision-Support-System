# AGENTS.md — repo guide & review standard

Context for any AI agent (Codex, Claude Code, etc.) reviewing or extending this repo.

## What this is
A **public portfolio demo (V1.1)** of an AI Station Configuration & Decision Support System — a controlled
agentic workflow (3 specialized LLM agents + RAG + a deterministic rule gate + human review), built on Coze
with synthetic data. It is an **AI-PM engineering demo**, not a production service. See [`README.md`](README.md).

## Layout
- `agents/` — one spec per agent (role · prompt · I/O · skills)
- `skills/` — capabilities: `knowledge-retrieval.md` (RAG, active) + `rule-check.js` (deterministic gate, tested)
- `knowledge_base/` — KB_01–04 (RAG source)
- `config/retrieval.yaml` — single source of truth for model/retrieval settings
- `evals/` — runnable gate eval (`node evals/run.js`, 9/9)
- `test-cases/`, `results/` — inputs + full raw traces
- `docs/` — build playbook, evaluation, product-decisions, rule-gate plan, recording storyboard
- `demo/` — screenshots + video (evidence, capture in progress)

## Commands
```bash
node skills/rule-check.js   # (module) — import in Node
node evals/run.js           # run the deterministic gate eval suite
```

## Review standard (the bar this repo is held to)
This repo has been through several rounds of adversarial review. Keep that bar:
1. **Honesty over polish.** No overclaiming. Mark status precisely: `active` / `reference impl` / `N/A pending` / `design assumption` / `synthetic`.
2. **Grounded RAG.** Agent 2 cites only the KB; external standards forbidden; unknown → "knowledge base not covered", never invented.
3. **Deterministic where it's safety-critical.** Hard constraints decided by `skills/rule-check.js` (code), not the LLM; a missing input is `NEEDS_REVIEW`, never an auto-pass.
4. **Grounding vs generation boundary.** Agent 3's design values are assumptions needing engineering calc, not KB facts; confidence is an evidence level, not a probability.
5. **Verifiable claims.** Prefer PASS/FAIL assertions and real traces over self-scored ratings. If a claim isn't backed by a run, say so.

## When reviewing
Classify findings P0/P1/P2/P3, each with: problem · why it matters · recommended fix · files affected. Do not modify files on a review pass unless asked.
