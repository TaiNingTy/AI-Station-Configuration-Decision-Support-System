# AI 站点配置与决策支持系统

[English](README.md) | **中文** · `Public Portfolio Demo V1`

> 把分散在资深设计师脑中和文档里的交通规划经验，沉淀为一个 **grounded（有据可依）、可溯源** 的 AI 工作流 —— 由三个专业化 LLM Agent + RAG 检索 + 一个人工复核交接组成的受控 agentic workflow，能配置自动驾驶公交站点、并且知道何时该把决定交还给人。

**角色：** AI 产品经理（端到端：问题定义 → Agent 设计 → 知识工程 → 评估）
**平台：** 扣子 (Coze) agentic workflow 编排 + RAG 知识库 · **模型：** 豆包 2.0 Pro
**模式：** 三个专业化 LLM Agent 组成固定流水线 + 人工复核交接 (human-review handoff)

> **本公开 Demo 的范围：** V1 版本，用**合成数据**复现原工作流中的知识检索、规则校验、配置推荐与人工复核部分。

<p align="center">
  <img src="assets/architecture_diagram.png" alt="架构图" width="900">
</p>

---

## 摘要 (TL;DR)

站点配置知识散落在资深设计师脑中和文档里 —— 标准不一、迭代缓慢。我把它做成一个 3-Agent 的 AI 流水线：读取场地简报，对照一个 grounded 知识库做校验，并起草交付文档 —— 同时**标出任何必须由人来做的决策**。过程中我诊断并修复了一个真实的 RAG 幻觉问题，这成了整个搭建中最有价值的一段。

---

## 1. 问题

一家自动驾驶公交公司为三个团队 —— **运营、工程、城市设计** —— 设计站点，各自标准不同，导致：

- 知识分散在人与文档中
- 规则靠人工解释、前后不一致
- 方案迭代慢，质量取决于哪位资深设计师有空

## 2. AI 机会

> 不是"做个聊天机器人"。真正的机会：**把领域知识编码成可执行、可审计的工作流。**

所以设计围绕三件事：**知识工程**、**Agent 编排**、以及 **AI 与人的边界**。

## 3. 解决方案 —— 3-Agent 流水线

```
场地简报
  → [1] 需求分析        → 结构化需求 (JSON)
  → [2] 检索 + 规则校验  → grounded 合规检查 + 风险 (JSON)   [知识库 / RAG]
  → ── 人工复核交接 (Human-review handoff) ──
  → [3] 配置 + 文档      → 交付文档 (Markdown)
```

| Agent | 职责 | 输出 |
|---|---|---|
| **[1 · 需求分析](agents/01-requirement-analysis.md)** | 解析场地简报，判定站点等级 (S/A/B/C) | `requirement.json` |
| **[2 · 检索 + 规则校验](agents/02-rule-evaluation.md)** | 从知识库检索、做合规检查、识别风险 —— **KB grounded、不编造** | `evaluation.json` |
| **[3 · 配置 + 文档](agents/03-configuration-doc.md)** | 推荐配置（参数 + 依据 + 置信度）、生成交付文档与 checklist | `proposal.md` |

每个 Agent 的角色、提示词、输入输出契约见 [`agents/`](agents/)；它们调用的技能见 [`skills/`](skills/)。完整产品规格（范围、功能/非功能需求、指标、里程碑）：[`docs/PRD.md`](docs/PRD.md)。

> 采用确定性流水线，而非自由自主交接 —— 企业场景下 **可控性与可评估性** 比自主性更重要，且错误容易定位到具体某个 Agent。

## 4. 知识工程

四份精心编写的文档（[`knowledge_base/`](knowledge_base/)），采用层级结构，便于检索时引用来源章节：

- `KB_01` 规划规范 · `KB_02` 工程约束 · `KB_03` 站点规则 · `KB_04` 历史案例

Agent 2 的检索为**每轮自动调用**、混合搜索、低匹配阈值、结果重排 —— 让 grounding 成为强制而非可选。

## 5. 人工复核 (Human Review)

三件事永远交还给人：**最终配置、工程可实施性、商业/预算决策。** 流水线会在交付文档顶部显式标出这些（标注"需人工决策"），而不是替人做决定。

> **状态 (V1.1 — 已验证)：** 确定性规则门禁已作为 Coze 工作流部署，并在任一 Critical FAIL 时**物理阻断下游生成** —— Code 节点硬判 PASS/FAIL、条件分支据此路由。用 token 计数证明：`curve_radius_m=27` → `BLOCKED`，生成节点**根本没执行（0 tokens，1s）**；`35` → `PASS`，生成节点执行（1431 tokens，32s）。LLM 只*解释*判定。（PASS 分支上的生成节点是代表性步骤；把完整 KB→规则校验→文档 Agent 接到它后面是进一步集成 —— 门禁行为完全一致。）见 [`docs/v1.1-rule-gate-plan.md`](docs/v1.1-rule-gate-plan.md)。

## 6. Demo —— 两个测试案例

完整输出见 [`results/sample-runs.md`](results/sample-runs.md)。

| 案例 | 输入 | 系统做了什么 |
|---|---|---|
| **TC1 · Greenfield**（合规） | 500人/时、低洼、B级 | **Grounded 验证 + 风险识别：** 确认 B 级成立（500 落在 200–600 区间，用地可布 2 车位侧式站台），标出低洼**排水**与 300m **供电**风险，并产出带 KB 引用 + 置信度的完整交付文档 —— 每条引用可溯源到 KB_01/KB_02、无编造。 |
| **TC2 · Central Hub**（硬约束）⭐ | 1800人/时、站台位于 27m 半径曲线 | **硬约束识别：** 半径 27m < 30m → *"不可实施"*。风险高、给出正解（"调整线位至 ≥30m"），并翻出 28m→35m 的先例 → **交还人工。** |

TC2 是全片论点的浓缩：**AI 识别出不可实施的方案、标为不可实施并交还人工复核，而不是自信地编一个解法。**（用代码硬阻断是 V1.1 门禁 —— 见[路线图](#9-路线图)。）

## 7. 评估

可验证 PASS/FAIL 断言（附定性维度）—— 完整内容见 [`docs/evaluation.md`](docs/evaluation.md)。
维度：推荐准确性 · 规则合规 · 风险识别 · 文档质量 · 人工复核。
确定性门禁有**可运行**评估：`node evals/run.js` → 9/9（[`evals/`](evals/)）。
每个设计选择背后的思考记录在 [`docs/product-decisions.md`](docs/product-decisions.md)。

## 8. 我解决的 RAG 问题（最有价值的一段）

初版 Agent 2 *看起来*很权威，实则在**编造** —— 引用真实感的国标（GB/T、CJJ）和一个虚构案例，而这些都不在知识库里。

- **诊断：** 引用对不上知识库、"相似案例"是编的 → 说明检索没真正 grounding。
- **修复：** 检索设为**自动调用**、匹配阈值降到 0.15、召回提到 10；并强化提示词 —— 只引用知识库、禁用外部规范、查不到就写**"知识库未覆盖"**。
- **结果：** 所有引用回归 `KB_0x`、出现诚实的"未覆盖"标注、四个知识库全部生效。

> **产品洞察：** 对 RAG 产品，核心指标不是"能不能答"，而是**"敢不敢承认不知道"**。可信度 > 完整度。

## 9. 路线图

- **本仓库 —— V1 公开 Demo** ✅ 知识库 + agentic workflow 规则校验 + 配置推荐 + 人工复核交接
- **V1.1（已完成）** 确定性规则门禁已部署并验证 —— Code 硬判 PASS/FAIL；Critical FAIL **物理阻断**下游生成（27→`BLOCKED`，生成节点 **0 tokens**；35→`PASS`，生成节点执行）。代码：[`skills/rule-check.js`](skills/rule-check.js)。
- **V1.2（下一步）** 把完整 KB→规则校验→文档 Agent 接到门禁的 PASS 分支后（门禁行为一致）。
- **V2** GIS/CAD 接入、需求预测、站点仿真
- **V3** 优化引擎、自动迭代

## 10. 仓库结构

```
├── README.md · README.zh-CN.md   ← 案例研究（英 / 中）
├── agents/                       一个 Agent 一个规格（角色·提示词·输入输出·技能）
│   ├── 01-requirement-analysis.md
│   ├── 02-rule-evaluation.md
│   └── 03-configuration-doc.md
├── skills/                       Agent 技能（无空壳）
│   ├── knowledge-retrieval.md    RAG 检索 —— 已启用
│   └── rule-check.js             确定性硬约束门禁 —— 参考实现 → V1.1
├── knowledge_base/               KB_01–04（RAG 源文档）
├── config/retrieval.yaml         模型 + 检索配置（唯一权威来源）
├── test-cases/inputs.md          测试输入
├── evals/                        可运行门禁评估 —— `node evals/run.js`（9/9）
├── results/                      sample-runs.md + 完整原始 trace（tc1 / tc2）
├── demo/                         运行证据（截图 + 视频链接）—— 补充中
├── docs/                         PRD · build-playbook · evaluation · product-decisions · rule-gate-plan · storyboard
├── AGENTS.md · CLAUDE.md         仓库指南 + 审查标准（给 AI 审查者）
└── assets/                       架构图（svg / png / pdf，含深色 & 自适应版）
```

## 11. 复现

重建这个 bot 所需的一切都在这里：把 `knowledge_base/` 传成知识库、按 [`agents/`](agents/) 建三个 Agent、把 [`knowledge-retrieval`](skills/knowledge-retrieval.md) 技能接到 Agent 2、套用 [`config/retrieval.yaml`](config/retrieval.yaml)、用 [`test-cases/inputs.md`](test-cases/inputs.md) 测试。完整步骤见 [`docs/build-playbook.md`](docs/build-playbook.md)。

## 12. 配置（唯一权威来源）

机器可读：[`config/retrieval.yaml`](config/retrieval.yaml)。

| 设置 | 值 |
|---|---|
| 模型 | 豆包 2.0 Pro |
| 检索模式 | 混合，每轮**自动调用** |
| 最大召回 Top-K | **10** |
| 最小匹配度 | **0.15** |
| 结果重排 | 开 |
| 知识库版本 | `demo-v1.1`（单车位通过能力 = 300 人/时）|
| 提示词版本 | `v1.1`（仅引用 KB、禁用外部规范）|

---

*简历句：* 将复杂的交通规划知识转化为标准化、AI 可执行的工作流 —— 让站点配置能力在运营、工程、设计团队间可复用、可审计。

*注：知识库内容与 Agent 提示词为中文（基于扣子搭建）；demo 数值为演示用。*
