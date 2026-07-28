/**
 * [INPUT]: 依赖工作台演示场景定义
 * [OUTPUT]: 对外提供审阅问题、规则类型与本地 mock 数据
 * [POS]: 货物审阅工作台的数据契约与演示数据源
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export type ReviewStep = "review" | "rules";
type Confidence = "medium" | "low";
type Severity = "blocking" | "warning";

export type ReviewIssue = {
  id: string;
  type: string;
  severity: Severity;
  confidence: Confidence;
  count: number;
  field: string;
  cell: string;
  raw: string | null;
  result: string | null;
  source: "继承" | "推算" | "待确认";
  reason: string;
  evidence: string;
  cargoName: string;
  spec: string;
};

export type RuleItem = {
  id: string;
  title: string;
  scope: string;
  source: string;
  quote?: string;
  value: string;
  needsConfirmation: boolean;
};

export const parsingStages = [
  "读取工作表",
  "识别表头与列映射",
  "还原合并单元格与向下填充",
  "补齐件级字段",
  "计算字段置信度",
  "生成审阅队列",
];
export const initialIssues: ReviewIssue[] = [
  {
    id: "dimension-1",
    type: "尺寸继承",
    severity: "warning",
    confidence: "medium",
    count: 6,
    field: "长 / 宽 / 高",
    cell: "KMSA待发运合同号明细!P47:R47",
    raw: null,
    result: "610 × 305 × 820 mm",
    source: "继承",
    reason: "继承自第 42 行，因大类与规格型号一致",
    evidence: "置信度 中 · 同组内 6 件规格一致 · 来源行尺寸完整",
    cargoName: "筛网组件",
    spec: "610×305",
  },
  {
    id: "unit-1",
    type: "单位冲突",
    severity: "blocking",
    confidence: "low",
    count: 2,
    field: "总体积",
    cell: "KMSA待发运合同号明细!S23",
    raw: "8.72",
    result: null,
    source: "待确认",
    reason: "总体积与长宽高推算值偏差 8.4%，无法自动裁决",
    evidence: "置信度 低 · 原表 8.72m³ · 尺寸推算 8.05m³",
    cargoName: "重型板式给料机",
    spec: "8700×2750×2500",
  },
  {
    id: "packing-1",
    type: "包装未知",
    severity: "warning",
    confidence: "low",
    count: 4,
    field: "包装方式",
    cell: "KMSA待发运合同号明细!T64",
    raw: "胶合板箱 plywood case",
    result: "木质包装",
    source: "推算",
    reason: "中英混写包装名称匹配到木质包装候选",
    evidence: "置信度 低 · 同名值 4 件 · 确认后写入本票词典",
    cargoName: "驱动装置",
    spec: "KMSA-DR-02",
  },
  {
    id: "box-1",
    type: "箱件关系不明",
    severity: "blocking",
    confidence: "low",
    count: 1,
    field: "历史箱件号",
    cell: "KMSA待发运合同号明细!U81",
    raw: "6/2",
    result: null,
    source: "待确认",
    reason: "二号柜历史序号缺少 4/2，且该柜历史毛重超过 26.5t",
    evidence: "置信度 低 · 历史值仅供核对 · 建议清空后重新计算",
    cargoName: "电机总成",
    spec: "YVP-450",
  },
  {
    id: "weight-1",
    type: "重量缺失",
    severity: "blocking",
    confidence: "low",
    count: 1,
    field: "总毛重",
    cell: "KMSA待发运合同号明细!O96",
    raw: null,
    result: null,
    source: "待确认",
    reason: "原表未提供总毛重，净重不能替代载重校验口径",
    evidence: "置信度 低 · 单件净重 1,270kg · 必须人工补充毛重",
    cargoName: "减速机",
    spec: "ZSY630",
  },
  {
    id: "stack-1",
    type: "堆码属性未知",
    severity: "warning",
    confidence: "medium",
    count: 3,
    field: "是否可叠",
    cell: "KMSA待发运合同号明细!V103",
    raw: "有限堆叠",
    result: "limited",
    source: "推算",
    reason: "备注可映射为有限堆叠，但未提供承压上限",
    evidence: "置信度 中 · 影响 3 件 · 规则确认时补充承压值",
    cargoName: "钢制框架",
    spec: "FRAME-08",
  },
  {
    id: "remark-1",
    type: "备注待确认",
    severity: "warning",
    confidence: "medium",
    count: 1,
    field: "特殊货品",
    cell: "KMSA待发运合同号明细!V118",
    raw: "含活性炭",
    result: null,
    source: "待确认",
    reason: "备注包含特殊货品关键词，需要确认隔离与堆放限制",
    evidence: "置信度 中 · 原文保留 · 不自动生成业务规则",
    cargoName: "半面罩",
    spec: "M-920",
  },
];

export const rules: RuleItem[] = [
  {
    id: "stack",
    title: "钢制框架 · 有限堆叠",
    scope: "影响 8 件",
    source: "来自发运单备注",
    quote: "备注 V23：有限堆叠",
    value: "有限堆叠 · 承压上限 2,500kg",
    needsConfirmation: true,
  },
  {
    id: "packing",
    title: "胶合板箱 · 木质包装",
    scope: "影响 12 件",
    source: "系统推断",
    quote: "包装方式 T64：胶合板箱 plywood case",
    value: "标准包装：木质包装",
    needsConfirmation: true,
  },
  {
    id: "oversize",
    title: "重型板式给料机 · 超长超重",
    scope: "影响 1 件",
    source: "需人工输入",
    quote: "8700 × 2750 × 2500mm / 23000kg / 裸装",
    value: "保持直立 · 单独占柜 · 框架箱",
    needsConfirmation: true,
  },
  {
    id: "special",
    title: "半面罩 · 特殊货品",
    scope: "影响 2 件",
    source: "来自发运单备注",
    quote: "备注 V118：含活性炭",
    value: "与液体、粉料隔离",
    needsConfirmation: true,
  },
  {
    id: "destination",
    title: "目的地承重上限",
    scope: "适用全票",
    source: "来自历史规则库",
    value: "26.5t · 40HQ 11800 × 2350 × 2390mm",
    needsConfirmation: false,
  },
  {
    id: "rotation",
    title: "木质包装 · 允许水平旋转",
    scope: "影响 18 件",
    source: "来自历史规则库",
    value: "允许水平 90° 旋转",
    needsConfirmation: false,
  },
];
