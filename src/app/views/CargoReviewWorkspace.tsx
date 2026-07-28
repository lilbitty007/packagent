/**
 * [INPUT]: 依赖单票据审阅数据、简化卡片组件与父页面流程回调
 * [OUTPUT]: 对外提供货物审阅与装柜规则确认工作台 CargoReviewWorkspace
 * [POS]: views 模块中连接解析校验与原装柜计算流程的页面编排层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Redo2, ShieldAlert, Sparkles, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { MetricCard, ReviewCard, RuleCard, StepBar } from "./CargoReviewCards";
import { highConfidenceCargo, initialIssues, rules } from "./cargoReviewData";
import type { IssueKind, ReviewIssue, ReviewStep } from "./cargoReviewData";

type RuleStatus = "pending" | "confirmed" | "skipped";

export function CargoReviewWorkspace({ onStartPacking, onBack }: { onStartPacking: () => void; onBack: () => void }) {
  const [step, setStep] = useState<ReviewStep>("review");
  const [pendingIssues, setPendingIssues] = useState<readonly ReviewIssue[]>(initialIssues);
  const [history, setHistory] = useState<readonly (readonly ReviewIssue[])[]>([]);
  const [redoHistory, setRedoHistory] = useState<readonly (readonly ReviewIssue[])[]>([]);
  const [openGroups, setOpenGroups] = useState<readonly IssueKind[]>(["missing", "conflict"]);
  const [showPassed, setShowPassed] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);
  const [showDefaults, setShowDefaults] = useState(false);
  const [drawerIssue, setDrawerIssue] = useState<ReviewIssue | null>(null);
  const [editValue, setEditValue] = useState("");
  const [ruleStatus, setRuleStatus] = useState<Readonly<Record<string, RuleStatus>>>(() =>
    Object.fromEntries(rules.map((rule) => [rule.id, rule.needsConfirmation ? "pending" : "confirmed"])),
  );

  const missingCount = pendingIssues.filter((issue) => issue.kind === "missing").length;
  const pendingCount = pendingIssues.reduce((total, issue) => total + issue.count, 0);
  const processedCount = 12 - pendingCount;
  const rulesPending = rules.filter((rule) => rule.needsConfirmation && ruleStatus[rule.id] === "pending").length;
  const issueGroups = useMemo(
    () => (["missing", "conflict"] as const).map((kind) => ({ kind, issues: pendingIssues.filter((issue) => issue.kind === kind).sort((a, b) => b.count - a.count) })),
    [pendingIssues],
  );

  const recordIssueState = (next: readonly ReviewIssue[], message: string) => {
    setHistory((items) => [...items.slice(-9), pendingIssues]);
    setRedoHistory([]);
    setPendingIssues(next);
    toast.success(`${message} · 可撤销`);
  };

  const resolveIssue = (id: string, action: "accepted" | "modified" | "skipped") => {
    const issue = pendingIssues.find((item) => item.id === id);
    if (!issue) return;
    if (issue.kind === "missing" && action !== "modified") {
      toast.error("缺失字段必须填写后才能处理");
      return;
    }
    recordIssueState(pendingIssues.filter((item) => item.id !== id), `${action === "modified" ? "已修改" : action === "accepted" ? "已接受" : "已跳过"} ${issue.count} 件`);
  };

  const acceptGroup = (kind: IssueKind) => {
    if (kind === "missing") {
      toast.error("缺失字段不能批量接受，请填写实际值");
      return;
    }
    const affected = pendingIssues.filter((issue) => issue.kind === kind).reduce((total, issue) => total + issue.count, 0);
    recordIssueState(pendingIssues.filter((issue) => issue.kind !== kind), `已批量接受 ${affected} 件`);
  };

  const openEditor = (issue: ReviewIssue) => {
    setEditValue("");
    setDrawerIssue(issue);
  };

  const confirmEdit = () => {
    if (!drawerIssue) return;
    const value = editValue.trim();
    const needsNumber = drawerIssue.field !== "包装方式";
    if (!value || (needsNumber && (!Number.isFinite(Number(value)) || Number(value) <= 0))) {
      toast.error(needsNumber ? "请输入大于 0 的有效数值" : "请填写包装方式");
      return;
    }
    resolveIssue(drawerIssue.id, "modified");
    setDrawerIssue(null);
    setEditValue("");
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setRedoHistory((items) => [...items, pendingIssues]);
    setHistory((items) => items.slice(0, -1));
    setPendingIssues(previous);
    toast("已撤销上一步操作");
  };

  const redo = () => {
    const next = redoHistory.at(-1);
    if (!next) return;
    setHistory((items) => [...items, pendingIssues]);
    setRedoHistory((items) => items.slice(0, -1));
    setPendingIssues(next);
    toast("已重做上一步操作");
  };

  return (
    <div className="min-h-full">
      <StepBar step={step} hasMissing={missingCount > 0} onStepChange={setStep} />

      <div className="pb-28 pt-7">
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600"><ArrowLeft size={14} />返回上传</button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{step === "review" ? "货物审阅" : "装柜规则确认"}</h1>
        <p className="text-sm font-medium text-slate-500 mt-1 mb-6">{step === "review" ? "仅审阅总毛重、长、宽、高、体积和包装方式" : "仅确认本票实际涉及的装柜规则"}</p>

        {step === "review" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <MetricCard label="解析件数" value="105 件" detail="93 件数据完整" />
              <MetricCard label="待确认" value={`${pendingCount} 项`} detail="预计约 4 分钟" />
              <MetricCard label="缺失项" value={`${missingCount} 项`} detail="未处理完不能进入下一步" danger={missingCount > 0} />
            </div>

            <div className="space-y-5">
              {issueGroups.map(({ kind, issues }) => {
                const open = openGroups.includes(kind);
                const title = kind === "missing" ? "缺失" : "冲突";
                const affected = issues.reduce((total, issue) => total + issue.count, 0);
                return (
                  <section key={kind} className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${kind === "missing" ? "border-red-200" : "border-amber-200"}`}>
                    <div className="p-4 flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => setOpenGroups((items) => items.includes(kind) ? items.filter((item) => item !== kind) : [...items, kind])} className="flex items-center gap-2">
                        {open ? <ChevronDown size={17} className="text-slate-400" /> : <ChevronRight size={17} className="text-slate-400" />}
                        <span className={`text-sm font-black ${kind === "missing" ? "text-red-600" : "text-amber-700"}`}>{title}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">{affected} 项</span>
                      </button>
                      <div className="ml-auto flex gap-2">
                        <button type="button" disabled={issues.length === 0} onClick={() => issues[0] && openEditor(issues[0])} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-blue-300 disabled:opacity-40">批量修改</button>
                        <button type="button" disabled={issues.length === 0 || kind === "missing"} title={kind === "missing" ? "缺失字段必须填写" : undefined} onClick={() => acceptGroup(kind)} className="px-3 py-2 rounded-lg bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400">全部接受</button>
                      </div>
                    </div>
                    {open && (
                      <div className="p-4 pt-0 space-y-3">
                        {issues.length > 0 ? issues.map((issue) => <ReviewCard key={issue.id} issue={issue} onResolve={(id, action) => action === "modified" ? openEditor(issue) : resolveIssue(id, action)} />) : <div className="rounded-xl bg-green-50 p-5 text-center text-sm font-bold text-green-700"><CheckCircle2 size={18} className="inline mr-2" />该类已全部处理</div>}
                      </div>
                    )}
                  </section>
                );
              })}

              <section className="rounded-xl border border-slate-200 bg-white">
                <button type="button" onClick={() => setShowPassed((value) => !value)} className="w-full flex items-center gap-2 p-4 text-sm font-bold text-slate-700">
                  <CheckCircle2 size={17} className="text-slate-400" />93 件数据完整，已自动通过
                  <span className="ml-auto text-xs text-blue-600">展开查看</span>
                </button>
                {showPassed && (
                  <div className="overflow-x-auto border-t border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500"><tr>{["明细品名", "规格型号", "总毛重kg", "长mm", "宽mm", "高mm", "体积m³", "包装方式"].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100">{highConfidenceCargo.map((cargo) => <tr key={cargo.spec}><td className="p-3 font-bold">{cargo.name}</td><td className="p-3">{cargo.spec}</td><td className="p-3">{cargo.grossWeightKg}</td><td className="p-3">{cargo.lengthMm}</td><td className="p-3">{cargo.widthMm}</td><td className="p-3">{cargo.heightMm}</td><td className="p-3">{cargo.volumeM3}</td><td className="p-3">{cargo.packing}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <button type="button" onClick={() => setShowProcessed((value) => !value)} className="w-full flex items-center justify-between text-sm font-bold text-slate-600"><span>已处理（{processedCount}）</span>{showProcessed ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
                {showProcessed && <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">已处理项目可通过撤销恢复并重新修改。</p>}
              </section>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[["件数", "105 件"], ["总毛重", "51.9 t"], ["总体积", "21.46 m³"], ["预估柜数", "2 × 40HQ"]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-[11px] font-bold text-slate-400">{label}</div><div className="mt-1 text-sm font-black text-slate-800">{value}</div></div>)}</div>
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3"><ShieldAlert size={18} className="text-amber-600 shrink-0" /><p className="text-xs font-medium text-amber-800">物流公司无法穷尽全部业务规则，系统推断出的规则不得自动生效，必须由人工确认。</p></div>
            <section>
              <h2 className="text-base font-black text-slate-800 mb-3">待确认（{rulesPending}）</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">{rules.filter((rule) => rule.needsConfirmation).map((rule) => <RuleCard key={rule.id} rule={rule} status={ruleStatus[rule.id]} onStatus={(status) => setRuleStatus((current) => ({ ...current, [rule.id]: status }))} />)}</div>
            </section>
            <section className="mt-7 rounded-xl border border-slate-200 bg-white">
              <button type="button" onClick={() => setShowDefaults((value) => !value)} className="w-full flex items-center p-4 text-sm font-black text-slate-800">已套用默认规则（2）<span className="ml-auto text-xs font-bold text-blue-600">{showDefaults ? "收起" : "展开复核"}</span></button>
              {showDefaults && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pt-0">{rules.filter((rule) => !rule.needsConfirmation).map((rule) => <RuleCard key={rule.id} rule={rule} status="confirmed" onStatus={() => undefined} />)}</div>}
            </section>
          </>
        )}
      </div>

      <div className="sticky bottom-0 z-40 mt-8 -mx-8 lg:-mx-10 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="max-w-[1200px] mx-auto px-8 lg:px-10 py-3 flex items-center gap-3">
          {step === "review" ? (
            <>
              <button type="button" aria-label="撤销" disabled={history.length === 0} onClick={undo} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Undo2 size={17} /></button>
              <button type="button" aria-label="重做" disabled={redoHistory.length === 0} onClick={redo} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Redo2 size={17} /></button>
              <div className={`ml-auto text-xs font-bold ${missingCount > 0 ? "text-red-600" : "text-green-600"}`}>{missingCount > 0 ? `还有 ${missingCount} 项缺失待填写` : `${processedCount} 项已确认`}</div>
              <button type="button" disabled={missingCount > 0} onClick={() => setStep("rules")} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400">完成审阅，进入规则确认</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep("review")} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} />返回货物审阅</button>
              <div className="ml-auto text-xs font-bold text-slate-500">{rulesPending > 0 ? `还有 ${rulesPending} 条规则待确认` : "本票规则已确认完毕"}</div>
              <button type="button" disabled={rulesPending > 0} onClick={onStartPacking} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"><Sparkles size={16} className="inline mr-1.5" />应用规则并开始装箱</button>
            </>
          )}
        </div>
      </div>

      {drawerIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20">
          <button type="button" aria-label="关闭批量修改" className="absolute inset-0" onClick={() => setDrawerIssue(null)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 shadow-xl p-6">
            <div className="flex justify-between"><div><h2 className="text-lg font-black text-slate-800">{drawerIssue.kind === "missing" ? "填写缺失值" : "批量修改冲突"}</h2><p className="text-xs text-slate-500 mt-1">将影响 {drawerIssue.count} 件</p></div><button type="button" onClick={() => setDrawerIssue(null)} className="p-2 text-slate-400"><X size={18} /></button></div>
            <label className="block mt-6"><span className="text-xs font-bold text-slate-600">{drawerIssue.field}</span><div className="mt-2 flex items-center rounded-xl border border-slate-200 px-3"><input value={editValue} onChange={(event) => setEditValue(event.target.value)} list={drawerIssue.field === "包装方式" ? "packing-options" : undefined} inputMode={drawerIssue.field === "包装方式" ? "text" : "decimal"} placeholder="请输入实际值" className="w-full py-3 text-sm font-bold outline-none" /><span className="text-xs text-slate-400">{drawerIssue.field === "总毛重" ? "kg" : ["长", "宽", "高"].includes(drawerIssue.field) ? "mm" : ""}</span></div></label>
            {drawerIssue.field === "包装方式" && <datalist id="packing-options">{["木箱", "木架", "出口木包", "胶合板箱 plywood case", "IBC吨桶", "托盘", "铁箱Iron box", "裸装", "木托", "钢结构外包"].map((packing) => <option key={packing} value={packing} />)}</datalist>}
            <div className="absolute bottom-0 inset-x-0 border-t border-slate-200 p-4 flex gap-2"><button type="button" onClick={() => setDrawerIssue(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">取消</button><button type="button" onClick={confirmEdit} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">确认修改</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
