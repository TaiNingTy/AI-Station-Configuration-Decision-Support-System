# Skill · Knowledge-Base Retrieval (RAG)

**Status:** ✅ active — wired into Agent 2 in the deployed bot
**Type:** retrieval / grounding
**Used by:** [Agent 2 · Rule Evaluation](../agents/02-rule-evaluation.md)

## What it does
Retrieves the most relevant chunks from the station knowledge base and injects them into Agent 2's
context, so rule evaluation is **grounded in real KB rules** instead of the model's parametric knowledge.
This is the mechanism that stops the agent from citing invented external standards.

## Source
[`knowledge_base/`](../knowledge_base/) — four documents, hierarchical chunking, accurate parse (to keep tables):

- `KB_01` Planning Guidelines
- `KB_02` Engineering Standards
- `KB_03` Station Rules
- `KB_04` Historical Cases

## Configuration
Single source of truth: [`config/retrieval.yaml`](../config/retrieval.yaml).
Hybrid search · **auto-called every turn** · `top_k: 10` · `match_threshold: 0.15` · rerank on.

## I/O contract
- **Input:** the structured requirement (or query text) from Agent 1
- **Output:** `kb_chunks` — top-k passages, each tagged with its source document, injected into Agent 2

## Guardrails (enforced in Agent 2's prompt)
- **KB-only:** the agent may cite **only** retrieved KB content; external standards (GB/T, CJJ …) are forbidden.
- **Honest gaps:** if nothing relevant is retrieved, the agent outputs `"知识库未覆盖"` — it does not invent a basis.

## Why it matters (the debugging story)
The first version silently fell back to the model's own knowledge and fabricated national standards.
Setting retrieval to auto-call, lowering the match threshold to 0.15, raising recall to 10, and hardening
the prompt fixed the grounding. Full write-up: [`docs/evaluation.md`](../docs/evaluation.md) §"关键工程发现".
