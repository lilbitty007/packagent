/**
 * [INPUT]: 依赖工作台数据类型、状态回调与 Lucide 图标
 * [OUTPUT]: 对外提供步骤条、指标卡、审阅卡与规则卡
 * [POS]: 货物审阅工作台的可复用展示与操作组件集合
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Check, CheckCircle2, ChevronRight, Eye, Layers3, Pencil } from "lucide-react";
import type { ReviewIssue, ReviewStep, RuleItem } from "./cargoReviewData";

export function StepBar({ step, reviewBlocked, onStepChange }: { step: ReviewStep; reviewBlocked: boolean; onStepChange: (step: ReviewStep) => void }) {
  const items = [
    { id: "parsed", label: "解析校验", completed: true },
    { id: "review", label: "① 货物审阅", completed: step === "rules" },
    { id: "rules", label: "② 规则确认", completed: false },
    { id: "packing", label: "装柜计算", completed: false },
  ];

  return (
    <div className="sticky top-0 z-30 -mx-8 lg:-mx-10 px-8 lg:px-10 py-3 bg-slate-50/95 border-b border-slate-200">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items.map((item, index) => {
          const current = item.id === step;
          const disabled = item.id === "rules" && reviewBlocked;
          const clickable = item.id === "review" || (item.id === "rules" && !disabled);
          return (
            <div key={item.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!clickable}
                title={disabled ? "还有阻断项待处理" : undefined}
                onClick={() => clickable && onStepChange(item.id as ReviewStep)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  current
                    ? "bg-blue-600 text-white"
                    : item.completed
                      ? "bg-green-50 text-green-700"
                      : clickable
                        ? "text-slate-600 hover:bg-white"
                        : "text-slate-400 cursor-not-allowed"
                }`}
              >
                {item.completed && <Check size={14} strokeWidth={3} />}
                {item.label}
              </button>
              {index < items.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function MetricCard({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "danger" | "success" }) {
  const tones = {
    default: "text-slate-800",
    danger: "text-red-600",
    success: "text-green-600",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-0">
      <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
      <div className={`text-xl font-black tracking-tight ${tones[tone]}`}>{value}</div>
      <div className="text-[11px] text-slate-500 font-medium mt-1 truncate" title={detail}>{detail}</div>
    </div>
  );
}

export function ReviewCard({ issue, onResolve }: { issue: ReviewIssue; onResolve: (id: string, action: "accepted" | "modified" | "deferred") => void }) {
  return (
    <div className={`border rounded-xl bg-white overflow-hidden ${issue.severity === "blocking" ? "border-red-200" : "border-slate-200"}`}>
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${issue.severity === "blocking" ? "bg-red-50 text-red-600" : issue.confidence === "low" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-700"}`}>
          {issue.severity === "blocking" ? "阻断" : issue.confidence === "low" ? "低置信度" : "中置信度"}
        </span>
        <span className="text-sm font-bold text-slate-800">{issue.cargoName}</span>
        <span className="text-xs text-slate-400">{issue.spec}</span>
        <span className="ml-auto text-xs font-bold text-slate-500">影响 {issue.count} 件</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">原始单元格</div>
          <div className="text-xs font-bold text-blue-600 break-all">{issue.cell}</div>
          <div className={`mt-2 text-sm font-bold ${issue.raw === null ? "text-slate-400 italic" : "text-slate-700"}`}>{issue.raw ?? "(空)"}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">上下文行</div>
          <div className="space-y-1 text-[11px]">
            <div className="grid grid-cols-[28px_1fr_auto] gap-2 text-slate-400"><span>46</span><span>筛网组件</span><span>610×305</span></div>
            <div className="grid grid-cols-[28px_1fr_auto] gap-2 rounded bg-blue-50 px-1.5 py-1 text-blue-700 font-bold"><span>47</span><span>{issue.cargoName}</span><span>{issue.field}</span></div>
            <div className="grid grid-cols-[28px_1fr_auto] gap-2 text-slate-400"><span>48</span><span>内容物明细</span><span>—</span></div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">系统结果</div>
          {issue.result ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-slate-800">{issue.result}</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{issue.source}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 border-b border-dashed border-red-400 pb-1">
              <span className="text-sm font-bold text-slate-500">待确认</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-600">待确认</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">推断依据</div>
          <p className="text-xs font-bold text-slate-700 leading-relaxed">{issue.reason}</p>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{issue.evidence}</p>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center gap-2 justify-end">
        <button type="button" className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-blue-600 transition-colors"><Eye size={14} className="inline mr-1" />查看原表</button>
        <button type="button" onClick={() => onResolve(issue.id, "deferred")} className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:border-slate-300 transition-colors">标记待定</button>
        <button type="button" onClick={() => onResolve(issue.id, "modified")} className="px-3 py-2 rounded-lg text-xs font-bold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 transition-colors"><Pencil size={13} className="inline mr-1" />修改</button>
        <button type="button" onClick={() => onResolve(issue.id, "accepted")} className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all"><Check size={14} className="inline mr-1" />接受</button>
      </div>
    </div>
  );
}

export function RuleCard({ rule, status, onStatus }: { rule: RuleItem; status: "pending" | "confirmed" | "skipped"; onStatus: (status: "confirmed" | "skipped") => void }) {
  const sourceTone = rule.source === "系统推断" ? "bg-amber-50 text-amber-700" : rule.source === "需人工输入" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700";
  return (
    <div className={`rounded-xl border bg-white p-5 ${status === "pending" ? "border-slate-200" : "border-green-200"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${status === "pending" ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"}`}>
          {status === "pending" ? <Layers3 size={18} /> : <Check size={18} strokeWidth={3} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-slate-800">{rule.title}</h3>
          <p className="text-xs font-bold text-slate-400 mt-1">{rule.scope}</p>
        </div>
        <span className={`text-[10px] font-bold rounded-md px-2 py-1 shrink-0 ${sourceTone}`}>{rule.source}</span>
      </div>

      {rule.quote && (
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
          <div className="text-[10px] font-bold text-slate-400 mb-1">原文引用</div>
          <p className="text-xs font-medium text-slate-700">{rule.quote}</p>
        </div>
      )}

      <div className="mt-4">
        <label className="text-[11px] font-bold text-slate-500">本票应用值</label>
        <div className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700">{rule.value}</div>
      </div>

      {rule.needsConfirmation && status === "pending" ? (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onStatus("skipped")} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">本票不适用</button>
          <button type="button" onClick={() => onStatus("confirmed")} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98]">确认</button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
          <CheckCircle2 size={15} /> {status === "skipped" ? "本票不适用" : "已确认"}
        </div>
      )}
    </div>
  );
}
