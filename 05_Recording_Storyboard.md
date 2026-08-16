# Demo 录屏分镜脚本 (Recording Storyboard)

> 目标：一段 **2.5–3 分钟** 的产品演示视频，放进 GitHub / 作品集 / 投递邮件。
> 主线：讲问题 → 看产品跑（重点 TC2 硬约束）→ 讲评估与 RAG 亮点。
> 旁白中英各一版，按面试岗位选一种录。

---

## 录制前准备
- **工具**：Mac 自带 QuickTime（"新建屏幕录制"）或 Loom（能同时录人脸+讲解）。
- **分辨率**：全屏或至少 1280×720。
- **提前开好**：① 浏览器开 GitHub 仓库页；② 扣子里打开 bot、**清空对话**、登录好。
- **隐私**：关掉无关标签页、通知；别露出邮箱/私人信息。
- **关键技巧**：每个 agent 要等 ~20 秒。**录的时候正常等，剪辑时把等待片段加速 4–8 倍**，或用旁白盖住等待。别让观众干等。
- **一镜到底也可以**：不想剪辑，就边等边讲，控制在 3.5 分钟内。

---

## 分镜表

### 🎬 S1 · 开场钩子（0:00–0:08）
- **画面**：GitHub 仓库首页顶部（标题 + 架构图）。
- **动作**：静止，或轻微下滚露出架构图。
- **旁白 EN**：*"This is an AI system that configures autonomous-transit stations — and, more importantly, knows when to hand the decision back to a human."*
- **旁白 ZH**："这是一个配置自动驾驶公交站点的 AI 系统 —— 更关键的是，它知道什么时候该把决定交还给人。"

### 🎬 S2 · 问题 + 架构（0:08–0:40）
- **画面**：GitHub README 的架构图 + 第 1、3 节。
- **动作**：指着架构图从左到右滑过三个 agent。
- **旁白 EN**：*"Station design knowledge was stuck in senior designers' heads — inconsistent, slow. I turned it into a three-agent pipeline: one analyzes the site, one checks it against a grounded knowledge base, one drafts the delivery doc. Between them sits a human checkpoint."*
- **旁白 ZH**："站点设计知识过去锁在资深设计师脑子里，标准不一、迭代慢。我把它做成三个 agent 的流水线：一个分析场地、一个对照知识库做校验、一个起草交付文档。中间保留一个人工确认节点。"

### 🎬 S3 · 输入场地简报（0:40–1:00）
- **画面**：扣子多 Agent 画布 + 右侧预览面板。
- **动作**：在对话框粘 **TC2 Central Hub** 输入，回车。
  > 项目：Central Hub 市中心两线换乘枢纽。客流：高峰约1800人/小时。路权：拟设站台处线路为曲线，半径约27m。用地充足。诉求：换乘顺畅、全天候候车、无障碍。
- **旁白 EN**：*"Let's give it a hard case: a downtown interchange, 1,800 passengers an hour, but the platform sits on a 27-meter-radius curve."*
- **旁白 ZH**："给它一个硬骨头案例：市中心换乘枢纽，高峰 1800 人每小时，但站台正好落在一段 27 米半径的曲线上。"

### 🎬 S4 · Agent 1 需求分析（1:00–1:18）
- **画面**：Agent① 输出的 JSON。
- **动作**：高亮 `station_grade: "S"` 和 `key_constraints`（曲线半径27m）。
- **旁白 EN**：*"Agent one parses the brief into structured data — correctly grades it 'S' for the flow, and captures the 27-meter curve as a key constraint."*
- **旁白 ZH**："第一个 agent 把简报解析成结构化数据 —— 正确判为 S 级，并把 27 米曲线记为关键约束。"

### 🎬 S5 · 交接（人工节点）（1:18–1:30）
- **画面**：你在对话框打"请继续，交给检索与规则校验 Agent"。
- **动作**：发送。
- **旁白 EN**：*"I designed the hand-offs as human checkpoints — a person confirms before it moves on. Here I pass it to the rule-evaluation agent."*
- **旁白 ZH**："我把交接设计成人工确认节点 —— 由人确认后才往下走。这里我把它交给规则校验 agent。"

### 🎬 S6 · Agent 2 —— 高光时刻 ⭐（1:30–2:05）
- **画面**：Agent② 的 JSON 输出。
- **动作**：**慢慢**高亮这几处：
  - `matched_rules` → `KB_02: 曲线半径<30m…不可实施`
  - `compliance_check` → `曲线站台半径: 不合规`
  - `risks` → `severity: 高，项目无法实施`
  - `similar_cases` → 28m→35m 的先例
- **旁白 EN**：*"Here's the whole point. It retrieves the engineering rule from the knowledge base — radius under 30 meters is not implementable — flags the plan as infeasible, proposes the fix, and even surfaces a past case that hit the same wall. It didn't invent a workable plan. It stopped, and handed the call back to engineering. Every citation traces to the knowledge base — no fabrication."*
- **旁白 ZH**："这就是整个产品的核心。它从知识库里检索到工程规则 —— 半径小于 30 米不可实施 —— 判定方案不成立、给出修正方案，还翻出一个撞过同样墙的历史案例。它没有硬编一个能用的方案，而是停下来、把决定交还给工程。每一条引用都能溯源到知识库，没有编造。"

### 🎬 S7 · Agent 3 交付文档（2:05–2:22）
- **画面**：Agent③ 输出的 Markdown 文档（可先跑好、这里滚动展示）。
- **动作**：滚到顶部标题 `# 需人工决策`，再滑过配置表、风险表、Checklist。
- **旁白 EN**：*"The third agent turns all of this into a delivery document — headed 'requires human decision', with a config table, confidence scores, and a risk checklist. Ready for review, not auto-approved."*
- **旁白 ZH**："第三个 agent 把这一切变成一份交付文档 —— 顶部标注'需人工决策'，带配置表、置信度、风险清单。是'待评审'，不是'自动通过'。"

### 🎬 S8 · 评估 + RAG 亮点（2:22–2:48）
- **画面**：GitHub 的 `03_Evaluation.md` 和 README 第 8 节。
- **动作**：滑过评估表，停在"关键工程发现"那段。
- **旁白 EN**：*"I evaluated it across five dimensions. And the most instructive part: the first version hallucinated — citing fake national standards. I traced it to a retrieval-grounding gap, fixed the settings and prompt, and got it to say 'not in the knowledge base' instead of making things up. For a RAG product, admitting uncertainty matters more than sounding complete."*
- **旁白 ZH**："我用五个维度做了评估。最有价值的一段是：初版会幻觉 —— 引用假的国标。我把问题定位到检索没真正 grounding，调了设置和提示词，让它宁可说'知识库没有'也不编。对 RAG 产品来说，敢承认不确定，比听起来很完整更重要。"

### 🎬 S9 · 收尾（2:48–2:58）
- **画面**：GitHub 仓库首页 或 架构图。
- **旁白 EN**：*"Grounded, auditable, human-gated. Full write-up, prompts, and knowledge base are in the repo."*
- **旁白 ZH**："Grounded、可溯源、关键决策交还人工。完整文档、提示词、知识库都在这个仓库里。"

---

## 剪辑清单
- [ ] 把每个 agent 的等待片段加速 / 剪短
- [ ] S6 高光处放慢、加高亮框或放大
- [ ] 开头加一张标题卡（产品名 + 你名字 + "AI PM Demo"）
- [ ] 结尾放 GitHub 链接
- [ ] 全长控制在 3 分钟内
- [ ] 导出 1080p，命名 `station-config-ai-demo.mp4`

## 面试官高频追问（背一下）
- **为什么工作流不用自主多智能体？** → 可控、可评估、错误可定位到单个 agent。
- **怎么防编造？** → 强制只引用知识库 + 标注来源 + 查不到写"未覆盖"。
- **哪些绝不自动化？** → 工程可实施性、商业/预算决策 —— 强制人工。
- **价值怎么量化？** → 方案生成时间(天→分钟)、评审迭代轮次、配置采纳率。
