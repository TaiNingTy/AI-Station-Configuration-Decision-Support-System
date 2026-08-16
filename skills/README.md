# Skills

Capabilities the agents can invoke. Each skill is declared in the agent spec that uses it
([`agents/`](../agents/)). No hollow entries — every skill here is either live in the deployed bot
or working reference code slated for deployment.

| Skill | Type | Status | Used by |
|---|---|---|---|
| [knowledge-retrieval](knowledge-retrieval.md) | RAG / grounding | ✅ **active** (deployed) | Agent 2 |
| [rule-check](rule-check.js) | deterministic rule engine | 🚧 **reference impl** → Coze Code node (V1.1) | Agent 2 |

> On Coze, a "skill" (技能) is a capability attached to an agent — here a knowledge base (RAG) and,
> in V1.1, a Code node. `knowledge-retrieval` is live; `rule-check` is real, runnable code that will be
> pasted into a Coze Code node so hard constraints are decided by code, not by the LLM. See the
> [Roadmap](../README.md#9-roadmap).
