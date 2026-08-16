# Demo 录屏分镜脚本 (Recording Storyboard) — 3-artifact version

> 目标：一段 **2.5–3.5 分钟** 视频，串起三样东西：GitHub 案例仓库 · 多 Agent Bot（会推理）· 门禁工作流（能拦截）。
> 主线：**架构 → 会推理 → 能拦截（0 token）→ 评估**。智能在前，控制在后，0-token 是记忆点。

## 为什么有两个 Coze 产物（一定要讲的一句）
> "V1 是对话式多 Agent 管线，展示 grounded 推理；然后我意识到——工程安全约束不该由 LLM'判断'、必须由代码'强制'——所以 V1.1 把硬约束做成了确定性门禁。**软的地方用 LLM，硬的地方用代码。**"

## 录制前准备
- **工具**：QuickTime「新建屏幕录制」或 Loom。分辨率 ≥ 1280×720。
- **开三个标签页**：① GitHub README；② 多 Agent Bot（预览面板开、**清空对话**）；③ 门禁工作流（试运行面板）。
- 关掉通知/无关标签；备好要粘的输入（便签）。
- **等待加速**：Bot 每个 agent ~20s，录时正常等、**剪辑加速 4–8 倍**；门禁那两次很快不用剪。

---

## 分镜

### 🎬 S1 · 开场（0:00–0:10）
- **画面**：GitHub 仓库首页 + 架构图。
- **旁白 EN**：*"An AI system that configures autonomous-transit stations — and knows when a decision must be enforced by code, not an LLM."*
- **旁白 ZH**："一个配置自动驾驶公交站点的 AI 系统 —— 而且知道哪些决定必须由代码强制、而不是交给 LLM。"

### 🎬 S2 · 架构（0:10–0:45）· Tab 1 GitHub
- 划过架构图三个 agent；点一下 `agents/` 和 `skills/` 文件夹。
- **EN**：*"Three specialized agents: analyze the site, ground rules against a knowledge base, generate the delivery doc. The capabilities they use live in `skills/` — a RAG retriever and a deterministic rule checker."*
- **ZH**："三个专业化 agent：分析场地、对照知识库做 grounded 校验、生成交付文档。它们用的技能在 `skills/` —— 一个 RAG 检索、一个确定性规则校验。"

### 🎬 S3 · 会推理（0:45–2:00）· Tab 2 多 Agent Bot
- 粘 **TC2 Central Hub** → 推到 Agent 2。
- 高亮：Agent 2 引用 **KB_02"曲线半径<30m 不可实施"** + 相似先例；来源全是 KB_0x。
- **EN**：*"Everything it cites traces to the knowledge base — no fabrication. The first version hallucinated fake national standards; I traced it to a retrieval-grounding gap and fixed it. This is the soft, semantic-reasoning layer."*
- **ZH**："每条引用都能溯源到知识库，没有编造。初版它会编假国标，我定位到检索没 grounding 并修好了。这是软性的、语义推理层。"

### 🎬 S4 · 能拦截 · 王牌（2:00–3:00）· Tab 3 门禁工作流 ⭐
- 跑 **`curve_radius_m=27`** → `BLOCKED`，**指着 `1s / 0 tokens`**。
- 再跑 **`35`** → `PASS`，**指着 `32s / 1431 tokens`**。
- **EN**：*"Same curve constraint — but here a code node decides, not the LLM. Watch the tokens: when it's BLOCKED the generation node burns **zero tokens** — it physically never runs. When it passes, it runs. That's the difference between an LLM being asked to stop and code enforcing a stop."*
- **ZH**："同一个曲线约束 —— 但这里是代码判、不是 LLM 判。看 token：被拦截时生成节点烧 **0 个 token**、根本没执行；通过时才跑。这就是'求 LLM 停下'和'代码强制停下'的区别。"

### 🎬 S5 · 评估 + 收尾（3:00–3:30）· Tab 1 GitHub
- 划过 `docs/evaluation.md`（PASS/FAIL 断言），提一句 `evals/run.js`（9/9 通过）和 `docs/product-decisions.md`。
- **EN**：*"Evaluated with verifiable assertions and a runnable gate eval — nine of nine. The product decisions and every prompt, rule, and raw output are in the repo."*
- **ZH**："用可验证断言 + 一个能跑的门禁评估（9/9 通过）做评测。产品决策、每个提示词/规则/原始输出都在仓库里。"

---

## 剪辑清单
- [ ] Bot 段（S3）的等待加速；门禁段（S4）保留真实 token 数字，别剪
- [ ] S4 的 27 与 35 两次运行**连着放**，是全片高潮
- [ ] 开头标题卡（产品名 + 你名字 + "AI PM Demo"），结尾放 GitHub 链接
- [ ] 全长 ≤ 3.5 分钟，导出 1080p，命名 `station-config-ai-demo.mp4`

## 面试官高频追问
- **为什么两个 Coze 产物？** → 软推理用 Bot、硬约束用 Workflow 代码门禁（软硬分界）。
- **怎么证明真阻断？** → 0 tokens vs 1431 tokens：BLOCKED 时生成节点没执行。
- **怎么防编造？** → 强制只引用知识库 + 禁外部规范 + 查不到写"未覆盖"。
- **哪些绝不自动化？** → 工程可实施性、商业/预算 —— 强制人工。
- **价值量化？** → 方案生成时间(天→分钟)、评审迭代轮次、配置采纳率。
