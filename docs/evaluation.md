# 评估设计 (Evaluation)

> 评估以**可验证断言 (PASS/FAIL)** 为主、主观打分为辅。

## A. 可验证断言

| 断言 | Greenfield (TC1) | Central Hub (TC2) | Hilltop (TC3) |
|---|---|---|---|
| 输出为合法 JSON（schema 通过） | ✅ | ✅ | ⬜  |
| 站点等级判定正确 | ✅ B | ✅ S | ⬜ |
| 关键规则命中 | ✅ 分级/容量 | ✅ 曲线半径<30m | ⬜ |
| 所有引用存在于 KB（可溯源） | ✅ | ✅ | ⬜ |
| 无外部虚构标准 | ✅ | ✅ | ⬜ |
| Critical FAIL 后阻断生成 | n/a（无硬约束） | ✅ **物理阻断已验证**：27→BLOCKED 生成节点 0 tokens（未执行）；35→PASS 生成节点 1431 tokens（执行）| ⬜ |
| 必备报告章节完整（0–5） | 5 | **N/A（** | ⬜ |
| 端到端耗时 | ~60s | ~45s（仅 A1+A2）| ⬜ |

> **状态诚实说明**：TC1 已在 KB v1.1 下**重跑验证**（2026-08-16）；TC2 Central Hub 已验证 **Agent 1+2+3 **；确定性门禁已作为独立 Coze 工作流**部署并验证物理阻断**：27→BLOCKED 时下游生成节点 0 tokens（未执行），35→PASS 时执行（1431 tokens）—— 用 token 计数证明 Critical FAIL 真正阻断生成。

## B. 定性维度（辅助，1–5）

Recommendation Accuracy · Rule Compliance · Risk Identification · Document Quality · Human-review handoff。Greenfield 五维达标；Central Hub 除 Document Quality（Agent 3 待跑）外达标。

---

## 实测记录（2026-08-15，扣子 agentic workflow + 豆包 2.0 pro）

**Central Hub (TC2) — Agent 1+2 已验证 ⭐**：正确判 S 级；引用 KB_02"曲线半径<30m 不可实施"精准命中；识别 27m<30m、severity 高、判"项目无法实施"、给正解"调整线位至 ≥30m"；检索到相似先例 28m→35m。**Agent 3 待重跑**：部署确定性门禁后，Critical FAIL 应真正阻断配置生成（门禁 = V1.1）。

**Greenfield (TC1) — 已验证（KB v1.1，2026-08-16）**：正确判 B 级、无误升级；用地可布 2 车位侧式站台、容量达标；标出低洼排水与 300m 供电风险；交付文档含依据 + 置信度 + 分阶段 Checklist（配置层数值为设计建议、非 KB 规则，见 raw 说明）。KB_04 案例检索本轮为空（检索覆盖波动，列入 future work）。

**Hilltop (TC3) — 待运行**：末端 C 级、无市电供电风险场景，尚未纳入实测。

### 关键工程发现
> **问题**：初版 Agent② 无视知识库，编造真实感国标(GB/T、CJJ)和虚构案例，典型的 RAG 幻觉。
> **诊断**：来源引用对不上知识库、相似案例是编的 → 判断检索未真正 grounding。
> **解决**：①检索设为"自动调用"、匹配度阈值降到0.15、召回数量提到10；②提示词强制"只引用知识库、禁用外部规范、查不到写'未覆盖'"。
> **结果**：来源全部回归 KB_0x、诚实标注未覆盖、4个知识库全部命中。
> **PM 洞察**：RAG 产品的核心不是"能不能答"，而是"敢不敢说不知道"——可信度 > 完整度。

## 未来指标
- Configuration Acceptance Rate（配置采纳率）
- Proposal Generation Time（方案生成时间：从数天→分钟级）
- Iteration Reduction（评审迭代轮次下降）


