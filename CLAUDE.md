# CLAUDE.md

Project guidance for Claude Code. This repo's overview, layout, commands, and **review standard** are in
[`AGENTS.md`](AGENTS.md) — follow it.

Claude-specific notes:
- The maintainer is a **non-developer PM** — when guiding Coze/GitHub/Terminal steps, be concrete and step-by-step, and make local git commits on their behalf (they push via GitHub Desktop, which holds their auth).
- Uphold the honesty standard in `AGENTS.md`: never mark something "verified" that hasn't been run; keep the EN/中文 READMEs in sync.
- Useful red-team lens for this product: hallucination, prompt injection, incorrect routing, silent failures, low-confidence outputs, rule/LLM conflicts, missing-context handling, eval leakage. Produce a report first; change files only when asked.
