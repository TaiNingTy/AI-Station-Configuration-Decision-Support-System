# Build Playbook — 在扣子(coze.cn)搭建 AI Station Configuration Assistant

> 目标：用最快路径跑通一个 3 节点 multi-agent workflow demo，能在 AI PM 面试中演示。
> 平台：coze.cn（扣子）｜ 形态：工作流(Workflow) ｜ 角色数：3

---

## 总览：你要做的 5 件事

| 步骤 | 做什么 | 产物 | 预计耗时 |
|---|---|---|---|
| S0 | 注册扣子、建工作空间 | 一个空间 | 15 min |
| S1 | 上传知识库（4 份文档） | 1 个知识库 | 30 min |
| S2 | 建工作流，拖 3 个 LLM 节点 + 1 个输出确认 | 可运行 workflow | 2-3 h |
| S3 | 用测试用例跑通 + 填评估表 | 跑通截图 + 评估数据 | 1 h |
| S4 | 录屏 + 讲解脚本 | Demo 视频 + portfolio 页 | 1-2 h |

**里程碑判断**：S1+S2 跑出一次完整结果 = 已经有可讲的 demo。S3/S4 是包装。

---

## S0. 准备（15 min）

1. 打开 https://www.coze.cn ，微信/手机号登录。
2. 左侧「工作空间」→ 新建一个个人空间，命名 `Glydways-AI-Assistant`。
3. 顶部模型：demo 用免费的「豆包」或「DeepSeek」系列即可，不用纠结。

---

## S1. 建知识库（30 min）

1. 左侧「资源库」→「知识库」→ 新建，命名 `Station-Knowledge-Base`，类型选「文本」。
2. 把本目录 `knowledge_base/` 里的 4 个文件逐个上传（或复制内容为在线文档）：
   - `KB_01_Planning_Guidelines.md` 规划规范
   - `KB_02_Engineering_Standards.md` 工程约束
   - `KB_03_Station_Rules.md` 站点配置规则
   - `KB_04_Historical_Cases.md` 历史案例
3. 分段方式：选「自动分段」即可（demo 够用）。
4. 上传后点「一键索引/处理」，等状态变绿。
5. **自检**：在知识库「测试」框里问一句「郊区通勤站的最小站台长度是多少」，能命中 KB_02 的条目 = 成功。

---

## S2. 建工作流（核心，2-3 h）

左侧「资源库」→「工作流」→ 新建 `station-config-flow`。

### 结构
```
开始(Start) → LLM节点1(需求分析) → 知识库检索节点 → LLM节点2(检索+规则校验)
→ [输出中间结果] → LLM节点3(配置+文档) → 结束(End)
```

### 逐节点配置

**① 开始节点（Start）**
- 新增输入变量：`site_info`（String，多行）——用户粘贴场地信息。

**② LLM 节点1 —— Requirement Analysis**
- 输入：`site_info`
- 系统提示词：见 `02_Agent_Prompts.md` 的【Prompt 1】
- 输出：让它输出 JSON。在节点「输出」里定义变量 `requirement_json`（String）。

**③ 知识库节点（Knowledge Retrieval）**
- 选择 `Station-Knowledge-Base`。
- 检索 query：引用节点1的 `requirement_json`（或直接引用 `site_info`）。
- 输出：`kb_chunks`（召回的知识片段）。
- 检索设置（与 README 配置表一致）：调用方式 **自动调用**、搜索策略 **混合**、**最大召回 10**、**最小匹配度 0.15**、结果重排 **开**。

**④ LLM 节点2 —— Rule Evaluation**
- 输入：`requirement_json` + `kb_chunks`
- 系统提示词：见 `02_Agent_Prompts.md` 的【Prompt 2】
- 输出：`evaluation_json`（含 命中规则 / 合规检查 / 风险清单）。

**⑤ （可选）输出中间结果 = Human-in-the-loop 展示点**
- demo 里最简单做法：在节点2后直接把 `evaluation_json` 作为一个中间输出展示，口头说明"此处真实产品会插入人工确认"。
- 想更真：扣子工作流支持「问答节点/输出节点」，加一个输出节点先把风险清单给用户看。

**⑥ LLM 节点3 —— Configuration + Documentation**
- 输入：`requirement_json` + `evaluation_json`
- 系统提示词：见 `02_Agent_Prompts.md` 的【Prompt 3】
- 输出：`final_doc`（Markdown 格式的配置方案 + 设计说明 + Checklist）。

**⑦ 结束节点（End）**
- 输出 `final_doc`。

### 连线
按①→②→③→④→⑤→⑥→⑦顺序连好，注意每个节点的输入变量要「引用」上游节点的输出。

### 调试
- 右上角「试运行」，粘贴 `01_Input_Sample.md` 里的样例。
- 逐节点看输出。节点1 JSON 格式不对就回去在 prompt 里强调"只输出 JSON"。

---

## S3. 评估（1 h）
1. 用 `03_Evaluation.md` 里的 3 个测试用例分别跑一遍。
2. 按评估表人工打分（准确性 / 合规 / 文档质量）。
3. 截图保存每次运行结果 —— 面试要用。

---

## S4. 包装（1-2 h）
1. 用「工作流」的分享/发布，或直接录屏走一遍完整流程。
2. 讲解按 `04_Demo_Script.md` 的 5 分钟脚本。
3. 把架构图 + 评估表 + 截图放进 portfolio 一页。

---

## 常见坑
- **节点2 不引用知识库**：一定要把知识库节点的输出 `kb_chunks` 显式喂给 LLM 节点2，否则就是纯编造。
- **JSON 解析失败**：在 prompt 末尾加"严格只输出 JSON，不要任何解释文字/markdown 代码块标记"。
- **想做真·多智能体**：先别。工作流稳定，面试讲"multi-agent pipeline / orchestration"完全成立。
