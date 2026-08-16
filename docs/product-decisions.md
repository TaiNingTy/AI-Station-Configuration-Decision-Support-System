# Product Decisions

The PM reasoning behind the system — each decision with the alternative considered, the choice, and why.
This is the part an interviewer probes; it matters more than the code.

---

## D1 · Fixed agentic workflow, not autonomous multi-agent
- **Alternatives:** (A) fully autonomous agents that plan/route themselves; (B) a fixed pipeline of specialized agents.
- **Decision:** B — a fixed pipeline.
- **Why:** enterprise value comes from **controllability, evaluability, and error localization**, not autonomy. A fixed pipeline lets me point at *which* agent failed and attach a test to it. Autonomy would trade that away for flexibility I don't need here.

## D2 · Deterministic code gate for hard constraints — not LLM judgment ⭐
- **Alternatives:** (A) let the rule-evaluation LLM decide PASS/FAIL on engineering constraints; (B) enforce hard constraints in code, LLM only explains.
- **Decision:** B.
- **Why:** safety-critical engineering rules (curve radius, platform length, accessibility gap) must be **stable and non-probabilistic**. An LLM "usually" catching a violation is not good enough. In the gate workflow this is provable: on a Critical FAIL the generation node **burns 0 tokens — it physically never runs**. Soft where reasoning helps, hard where safety demands.

## D3 · Grounded RAG: KB-only citation + honest "not covered"
- **Alternatives:** (A) let the model answer freely (fluent, sometimes fabricated); (B) force retrieval, cite only the KB, and say "not covered" when no basis exists.
- **Decision:** B.
- **Why:** the first version hallucinated real-sounding national standards (GB/T, CJJ) that weren't in the KB. For a RAG product the core metric isn't "can it answer" — it's **"will it admit when it doesn't know."** Trustworthiness beats completeness. (Fix documented in [`evaluation.md`](evaluation.md) §关键工程发现.)

## D4 · Human-review handoff for feasibility & business decisions
- **Alternatives:** (A) auto-approve the AI's configuration; (B) route engineering feasibility and business/budget calls back to a human.
- **Decision:** B — the system **surfaces** these (marked "requires human decision") rather than deciding them.
- **Why:** these carry legal/financial consequence and depend on context the system doesn't hold. The AI's job is to prepare the decision, not make it.

## D5 · Separate grounding (Agent 2) from generation (Agent 3)
- **Decision:** Agent 2 does KB-grounded compliance (only KB-cited claims); Agent 3 generates the config document.
- **Why:** they have different truth standards. Agent 3's numeric values (cable gauge, cost estimates, platform length beyond the minimum) are **design assumptions requiring engineering calculation**, clearly distinct from Agent 2's KB-cited rules. Blurring them is how "grounded" claims quietly become fabrication.

## D6 · Confidence as evidence-level, not probability
- **Decision:** treat the model's `confidence %` as a **self-reported evidence level (High/Med/Low)**, not a calibrated probability.
- **Why:** a model reporting "100%" is not a real probability. Presenting it as one would overstate certainty on values that still need human/engineering confirmation.

## D7 · Synthetic data + explicit scope disclaimer
- **Decision:** rebuild the retrieval / rule-validation / config / human-review portions with **synthetic data**; exclude spatial/GIS analysis, proprietary optimization, and regional rule packs.
- **Why:** protects proprietary information from the original project and keeps the public demo honest about what it does and doesn't cover.

## D8 · Two Coze artifacts (Bot + Workflow) on purpose
- **Decision:** keep both — a multi-agent **Bot** (conversational pipeline, V1) and a **Workflow** with the deterministic gate (V1.1).
- **Why:** the Bot shows grounded multi-agent *reasoning*; the Workflow shows deterministic *control* (a Code node + conditional branch the Bot canvas can't host). Together they tell the evolution: conversational prototype → engineered, controllable pipeline. Same thesis, two layers.

---

*Open questions I'd want answered before calling this production-ready:* full 3-agent integration behind the gate (V1.2), per-chunk citation metadata (to fix intermittent case retrieval), calibrated confidence, and an automated eval set larger than the current cases.
