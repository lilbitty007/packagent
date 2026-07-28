/**
 * [INPUT]: 依赖简化工作台数据类型、状态回调与 Lucide 图标
 * [OUTPUT]: 对外提供步骤条、指标卡、三段式审阅卡与规则卡
 * [POS]: 货物审阅工作台的复用展示和操作组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Check, CheckCircle2, ChevronRight, Pencil, SkipForward } from "lucide-react";
import type { ReviewIssue, ReviewStep, RuleControl, RuleItem } from "./cargoReviewData";

export function StepBar({ step, hasMissing, onStepChange }: { step: ReviewStep; hasMissing: boolean; onStepChange: (step: ReviewStep) => void }) {
  const items = [
    { id: "parsed", label: "解析校验", completed: true },
    { id: "review", label: "① 货物审阅", completed: step === "rules" },
    { id: "rules", label: "② 规则确认", completed: false },
    { id: "packing", label: "装柜计算", completed: false },
  ] as const;

  return (
    <div className="sticky top-0 z-30 -mx-8 lg:-mx-10 px-8 lg:px-10 py-3 bg-slate-50/95 border-b border-slate-200">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items.map((item, index) => {
          const current = item.id === step;
          const disabled = item.id === "rules" && hasMissing;
          const clickable = item.id === "review" || (item.id === "rules" && !disabled);
          return (
            <div key={item.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!clickable}
                title={disabled ? "还有缺失项待填写" : undefined}
                onClick={() => clickable && onStepChange(item.id as ReviewStep)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${current ? "bg-blue-600 text-white" : item.completed ? "bg-green-50 text-green-700" : clickable ? "text-slate-600 hover:bg-white" : "text-slate-400 cursor-not-allowed"}`}
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
export function MetricCard({ label, value, detail, danger = false }: { label: string; value: string; detail: string; danger?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
      <div className={`text-xl font-black tracking-tight ${danger ? "text-red-600" : "text-slate-800"}`}>{value}</div>
      <div className="text-[11px] text-slate-500 font-medium mt-1">{detail}</div>
    </div>
  );
}

export function ReviewCard({ issue, onResolve }: { issue: ReviewIssue; onResolve: (id: string, action: "accepted" | "modified" | "skipped") => void }) {
  const missing = issue.kind === "missing";
  return (
    <div className={`rounded-xl border bg-white overflow-hidden ${missing ? "border-red-200" : "border-amber-200"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">哪一件</div>
          <div className="text-sm font-black text-slate-800">{issue.cargoName}</div>
          <div className="text-xs text-slate-500 mt-1">{issue.spec}</div>
          <div className="text-[11px] font-bold text-blue-600 mt-3">原表第 {issue.row} 行</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">问题是什么</div>
          <div className={`text-sm font-black ${missing ? "text-red-600" : "text-amber-700"}`}>{issue.problem}</div>
          <div className="text-[11px] text-slate-400 mt-3 break-all">{issue.cell}</div>
          <div className={`mt-1 text-sm font-bold ${issue.raw === null ? "text-slate-400 italic" : "text-slate-700"}`}>{issue.raw ?? "(空)"}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 mb-2">系统处理与依据</div>
          {issue.handling ? (
            <div className="text-sm font-bold text-slate-800">{issue.handling}</div>
          ) : (
            <div className="inline-flex items-center gap-2 border-b border-dashed border-red-400 pb-1">
              <span className="text-sm font-bold text-slate-500">无法判断</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-600">待填写</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">{issue.reason}</p>
        </div>
      </div>
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
        <button type="button" onClick={() => onResolve(issue.id, "skipped")} className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white"><SkipForward size={13} className="inline mr-1" />跳过</button>
        <button type="button" onClick={() => onResolve(issue.id, "modified")} className="px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-bold text-blue-600 hover:bg-blue-50"><Pencil size={13} className="inline mr-1" />就地修改</button>
        <button type="button" disabled={missing} title={missing ? "缺失值必须填写，不能直接接受" : undefined} onClick={() => onResolve(issue.id, "accepted")} className="px-3 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"><Check size={14} className="inline mr-1" />接受</button>
      </div>
    </div>
  );
}

function RuleEditor({ control }: { control: RuleControl }) {
  switch (control.type) {
    case "stack":
      return (
        <div className="grid grid-cols-2 gap-2">
          <select defaultValue={control.value} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            <option>可叠</option><option>有限可叠</option><option>不可叠</option>
          </select>
          {control.value === "有限可叠" && <div className="flex items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700"><input defaultValue={control.loadKg} className="min-w-0 flex-1 outline-none" /><span>kg</span></div>}
        </div>
      );
    case "packing":
      return <div className="grid grid-cols-2 gap-2"><input defaultValue={control.value} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700" /><select defaultValue={control.invertible ? "允许倒置" : "不可倒置"} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><option>不可倒置</option><option>允许倒置</option></select></div>;
    case "exclusive":
      return <select defaultValue={control.value ? "单独占柜" : "允许混装"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><option>单独占柜</option><option>允许混装</option></select>;
    case "isolation":
      return <select defaultValue={control.value ? "需要隔离" : "无需隔离"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><option>需要隔离</option><option>无需隔离</option></select>;
  }
}

export function RuleCard({ rule, status, onStatus }: { rule: RuleItem; status: "pending" | "confirmed" | "skipped"; onStatus: (status: "confirmed" | "skipped") => void }) {
  const inferred = rule.source === "系统推断";
  return (
    <div className={`rounded-xl border bg-white p-5 ${status === "pending" ? "border-slate-200" : "border-green-200"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${status === "pending" ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"}`}>{status === "pending" ? <span className="text-xs font-black">规</span> : <Check size={18} strokeWidth={3} />}</div>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-black text-slate-800">{rule.title}</h3><p className="text-xs font-bold text-slate-400 mt-1">{rule.scope}</p></div>
        <span className={`text-[10px] font-bold rounded-md px-2 py-1 shrink-0 ${inferred ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{rule.source}</span>
      </div>
      {rule.quote && <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3"><div className="text-[10px] font-bold text-slate-400 mb-1">备注原文</div><p className="text-xs font-medium text-slate-700">{rule.quote}</p></div>}
      <div className="mt-4"><div className="text-[11px] font-bold text-slate-500 mb-2">规则内容</div><RuleEditor control={rule.control} /></div>
      {rule.needsConfirmation && status === "pending" ? (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onStatus("skipped")} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">本票不适用</button>
          <button type="button" className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50">修改</button>
          <button type="button" onClick={() => onStatus("confirmed")} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">确认</button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600"><CheckCircle2 size={15} />{status === "skipped" ? "本票不适用" : "已确认"}</div>
      )}
    </div>
  );
}
