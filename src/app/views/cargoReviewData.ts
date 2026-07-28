/**
 * [INPUT]: 依赖简化工作台的六字段审阅范围与四类装柜规则
 * [OUTPUT]: 对外提供审阅问题、规则类型和单票据 mock 数据
 * [POS]: 货物审阅工作台的数据契约与唯一演示票据
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export type ReviewStep = "review" | "rules";
export type IssueKind = "missing" | "conflict";
export type ReviewField = "总毛重" | "长" | "宽" | "高" | "体积" | "包装方式";

export type ReviewIssue = {
  readonly id: string;
  readonly kind: IssueKind;
  readonly field: ReviewField;
  readonly count: number;
  readonly cargoName: string;
  readonly spec: string;
  readonly row: number;
  readonly cell: string;
  readonly raw: string | null;
  readonly problem: string;
  readonly handling: string | null;
  readonly reason: string;
};

export type RuleControl =
  | { readonly type: "stack"; readonly value: "可叠" | "有限可叠" | "不可叠"; readonly loadKg?: number }
  | { readonly type: "packing"; readonly value: string; readonly invertible: boolean }
  | { readonly type: "exclusive"; readonly value: boolean }
  | { readonly type: "isolation"; readonly value: boolean };

export type RuleItem = {
  readonly id: string;
  readonly title: string;
  readonly scope: string;
  readonly source: "来自备注" | "系统推断" | "默认规则";
  readonly quote?: string;
  readonly control: RuleControl;
  readonly needsConfirmation: boolean;
};

export type PassedCargo = {
  readonly name: string;
  readonly spec: string;
  readonly grossWeightKg: number;
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly volumeM3: number;
  readonly packing: string;
};

export const parsingStages = ["读取工作表", "识别表头", "补齐件级数据", "生成审阅清单"] as const;

export const initialIssues: readonly ReviewIssue[] = [
  {
    id: "missing-height",
    kind: "missing",
    field: "高",
    count: 1,
    cargoName: "筛网组件",
    spec: "610×305",
    row: 47,
    cell: "KMSA待发运合同号明细!R47",
    raw: null,
    problem: "高度缺失",
    handling: null,
    reason: "无法可靠判断，需人工填写",
  },
  {
    id: "missing-weight",
    kind: "missing",
    field: "总毛重",
    count: 1,
    cargoName: "减速机",
    spec: "ZSY630",
    row: 96,
    cell: "KMSA待发运合同号明细!O96",
    raw: null,
    problem: "总毛重缺失",
    handling: null,
    reason: "净重不得回填毛重，需人工填写",
  },
  {
    id: "missing-packing",
    kind: "missing",
    field: "包装方式",
    count: 1,
    cargoName: "驱动装置",
    spec: "KMSA-DR-02",
    row: 64,
    cell: "KMSA待发运合同号明细!T64",
    raw: null,
    problem: "包装方式缺失",
    handling: null,
    reason: "原表无可靠来源，需人工选择或输入",
  },
  {
    id: "conflict-volume",
    kind: "conflict",
    field: "体积",
    count: 5,
    cargoName: "重型板式给料机",
    spec: "8700×2750×2500",
    row: 23,
    cell: "KMSA待发运合同号明细!S23",
    raw: "65.78m³",
    problem: "体积与长宽高推算偏差 12%",
    handling: "保留原表体积，等待人工确认",
    reason: "总体积与尺寸推算值偏差超过 5%，系统不静默裁决",
  },
  {
    id: "conflict-unit",
    kind: "conflict",
    field: "长",
    count: 4,
    cargoName: "钢制框架",
    spec: "FRAME-08",
    row: 81,
    cell: "KMSA待发运合同号明细!P81",
    raw: "6100mm / 6.35M",
    problem: "mm 与 M 双尺寸列换算偏差 4.1%",
    handling: "尺寸只取 6100mm，米制列仅作冲突提示",
    reason: "长M 只用于交叉校验，偏差超过 2% 需人工确认",
  },
];
export const highConfidenceCargo: readonly PassedCargo[] = [
  { name: "木箱机架", spec: "BX-1200", grossWeightKg: 860, lengthMm: 1220, widthMm: 980, heightMm: 1100, volumeM3: 1.32, packing: "木箱" },
  { name: "过滤组件", spec: "GL-08", grossWeightKg: 420, lengthMm: 980, widthMm: 760, heightMm: 820, volumeM3: 0.61, packing: "木架" },
  { name: "IBC 储液桶", spec: "IBC-1000", grossWeightKg: 1180, lengthMm: 1200, widthMm: 1000, heightMm: 1160, volumeM3: 1.39, packing: "IBC吨桶" },
  { name: "电控柜", spec: "EC-450", grossWeightKg: 535, lengthMm: 900, widthMm: 700, heightMm: 1800, volumeM3: 1.13, packing: "胶合板箱 plywood case" },
];

export const rules: readonly RuleItem[] = [
  {
    id: "stack",
    title: "筛网 · 不可叠放",
    scope: "影响 8 件",
    source: "来自备注",
    quote: "备注 V23：不可叠放",
    control: { type: "stack", value: "不可叠" },
    needsConfirmation: true,
  },
  {
    id: "packing",
    title: "胶合板箱 · 包装默认规则",
    scope: "影响 12 件",
    source: "系统推断",
    control: { type: "packing", value: "木质包装", invertible: false },
    needsConfirmation: true,
  },
  {
    id: "oversize",
    title: "重型板式给料机 · 超长超重",
    scope: "影响 1 件 · 8700×2750×2500mm · 23000kg · 裸装",
    source: "系统推断",
    control: { type: "exclusive", value: true },
    needsConfirmation: true,
  },
  {
    id: "special",
    title: "半面罩 · 特殊货品",
    scope: "影响 2 件",
    source: "来自备注",
    quote: "备注 V118：含活性炭",
    control: { type: "isolation", value: true },
    needsConfirmation: true,
  },
  {
    id: "default-pallet",
    title: "托盘货物 · 默认装箱规则",
    scope: "影响 28 件",
    source: "默认规则",
    control: { type: "stack", value: "有限可叠", loadKg: 2500 },
    needsConfirmation: false,
  },
  {
    id: "default-iron",
    title: "铁箱Iron box · 默认装箱规则",
    scope: "影响 16 件",
    source: "默认规则",
    control: { type: "packing", value: "钢铁包装", invertible: false },
    needsConfirmation: false,
  },
];
