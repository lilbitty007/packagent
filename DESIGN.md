# PackAgent Design System

## 1. Atmosphere & Identity

清晰、可信、可追溯的物流运营工作台。界面以蓝灰色中性表面承载高密度业务信息，关键阻断项只使用语义红色强调；签名体验是“从问题聚合到证据溯源再到批量确认”的连续审阅路径。

## 2. Color

### Palette

| 角色 | Tailwind token | 用途 |
|---|---|---|
| 页面表面 | `bg-slate-50` / `bg-white` | 页面、卡片、浮层 |
| 主文本 | `text-slate-800` | 标题与关键数据 |
| 次文本 | `text-slate-500` / `text-slate-400` | 说明、元数据、禁用态 |
| 边框 | `border-slate-200` / `border-slate-100` | 卡片、分组、分隔 |
| 主操作 | `blue-600` / `blue-700` | CTA、当前步骤、链接 |
| 信息表面 | `blue-50` / `blue-100` | 选中态与提示 |
| 成功 | `green-50` / `green-600` | 完成与自动通过 |
| 警告 | `amber-50` / `amber-600` | 中置信度与待裁决 |
| 低置信度 | `orange-50` / `orange-600` | 低置信度 |
| 阻断 | `red-50` / `red-600` | 阻断问题与错误提示 |

不新增自定义色值；所有新页面颜色均来自现有 Tailwind 语义色阶。

## 3. Typography

沿用项目 `font-sans`。

| 层级 | Tailwind token | 用途 |
|---|---|---|
| 页面标题 | `text-2xl font-black` | 页面主标题 |
| 区块标题 | `text-base font-bold` | 分组与卡片标题 |
| 正文 | `text-sm font-medium` | 主要业务信息 |
| 辅助 | `text-xs` | 标签、说明与元数据 |
| 微标签 | `text-[11px] font-bold` | Badge 与字段标题 |

## 4. Spacing & Layout

- 基础间距单位为 4px，使用 Tailwind 标准 spacing。
- 主内容最大宽度沿用 Layout 的 `max-w-[1200px]`。
- 工作台桌面端采用约 240px 左栏与自适应右栏；小于 `lg` 时堆叠。
- 卡片圆角使用 `rounded-xl`，页面级容器使用 `rounded-2xl`。
- 固定操作条与步骤条使用粘性定位，但不遮挡正文。

## 5. Components

### MetricCard

- 结构：标签、主值、辅助说明。
- 状态：默认、警告、阻断、成功。
- 交互：抽查链接提供 hover、focus 状态。

### StepBar

- 结构：解析校验、货物审阅、规则确认、装柜计算。
- 状态：完成、当前、未达、禁用。
- 无障碍：禁用步骤保留原因文本；按钮具备 focus ring。

### IssueGroup

- 结构：问题类型标题、计数、进度、批量操作、审阅卡。
- 状态：展开、折叠、已完成、含阻断。
- 交互：批量接受、批量修改、单卡处理。

### ReviewCard

- 结构：原始单元格、上下文行、系统结果、推断依据四区。
- 状态：待处理、已接受、已修改、待定。
- 待确认字段使用虚线边框与 Badge，不展示占位数值。

### RuleCard

- 结构：规则标题、适用范围、来源、原文、建议值、操作。
- 状态：待确认、已确认、本票不适用、自动匹配。

### StickyActionBar

- 结构：次要操作组、进度摘要、主 CTA。
- 状态：可用、禁用、完成。
- 无障碍：禁用原因同时以可见文本表达。

## 6. Motion & Interaction

- 微交互使用 `transition-colors` / `transition-all`，时长沿用 Tailwind 默认值。
- 解析动画只使用透明度、位移和脉冲，不修改装柜计算动画。
- 所有按钮提供 hover、active、focus-visible 与 disabled 状态。
- 不使用无限装饰动画；解析动画仅在解析阶段运行。

## 7. Depth & Surface

采用混合策略：卡片以 `border-slate-200` 为主要分层，重点容器沿用 `shadow-sm`；抽屉与固定操作条使用更明确的边框和轻阴影。禁止使用与现有页面不一致的玻璃、霓虹或重渐变效果。
