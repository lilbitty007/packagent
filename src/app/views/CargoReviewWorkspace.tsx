/**
 * [INPUT]: 依赖审阅 mock 数据、工作台卡片组件与父页面流程回调
 * [OUTPUT]: 对外提供货物审阅与装柜规则确认工作台 CargoReviewWorkspace
 * [POS]: views 模块中连接解析校验与原装柜计算流程的页面编排层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Redo2, ShieldAlert, Sparkles, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { MetricCard, ReviewCard, RuleCard, StepBar } from "./CargoReviewCards";
import { initialIssues, rules } from "./cargoReviewData";
import type { ReviewIssue, ReviewStep } from "./cargoReviewData";

export function CargoReviewWorkspace({ onStartPacking, onBack }: { onStartPacking: () => void; onBack: () => void }) {
  const [ticket, setTicket] = useState<"standard" | "elevator">("standard");
  const [step, setStep] = useState<ReviewStep>("review");
  const [pendingIssues, setPendingIssues] = useState(initialIssues);
  const [processedCount, setProcessedCount] = useState(0);
  const [openGroups, setOpenGroups] = useState<string[]>(initialIssues.map((item) => item.type));
  const [viewMode, setViewMode] = useState<"issues" | "rows">("issues");
  const [ruleStatus, setRuleStatus] = useState<Record<string, "pending" | "confirmed" | "skipped">>(() =>
    Object.fromEntries(rules.map((rule) => [rule.id, rule.needsConfirmation ? "pending" : "confirmed"])),
  );
  const [drawerIssue, setDrawerIssue] = useState<ReviewIssue | null>(null);
  const blockingCount = pendingIssues.filter((item) => item.severity === "blocking").length;
  const pendingCount = pendingIssues.reduce((sum, item) => sum + item.count, 0);
  const rulesPending = rules.filter((rule) => rule.needsConfirmation && ruleStatus[rule.id] === "pending").length;

  const groupedIssues = useMemo(() => pendingIssues.map((issue) => ({ type: issue.type, issue })), [pendingIssues]);

  const resolveIssue = (id: string, action: "accepted" | "modified" | "deferred") => {
    const issue = pendingIssues.find((item) => item.id === id);
    if (!issue) return;
    if (action === "deferred") {
      toast("已标记待定，阻断项仍需处理后才能进入下一步");
      return;
    }
    setPendingIssues((items) => items.filter((item) => item.id !== id));
    setProcessedCount((count) => count + issue.count);
    toast.success(`${action === "modified" ? "已修改" : "已接受"} ${issue.count} 件`);
  };

  const acceptAll = (type: string) => {
    const matches = pendingIssues.filter((item) => item.type === type);
    const total = matches.reduce((sum, item) => sum + item.count, 0);
    setPendingIssues((items) => items.filter((item) => item.type !== type));
    setProcessedCount((count) => count + total);
    toast.success(`已批量接受 ${total} 件`);
  };

  const toggleAll = (open: boolean) => setOpenGroups(open ? initialIssues.map((item) => item.type) : []);

  const switchTicket = (next: "standard" | "elevator") => {
    setTicket(next);
    toast(next === "standard" ? "已切换至 KMSA 标准票" : "已切换至 4 部电梯测试票");
  };

  const reviewBlocked = blockingCount > 0;

  return (
    <div className="min-h-full pb-24">
      <StepBar step={step} reviewBlocked={reviewBlocked} onStepChange={setStep} />

      <div className="pt-7">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600"><ArrowLeft size={14} />返回上传</button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{step === "review" ? "货物审阅工作台" : "装柜规则确认"}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">{step === "review" ? "只处理需要人工判断的内容，高置信度数据已自动通过" : "只确认本票求解所需的最少装柜属性"}</p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button type="button" onClick={() => switchTicket("standard")} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${ticket === "standard" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>KMSA 标准票</button>
            <button type="button" onClick={() => switchTicket("elevator")} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${ticket === "elevator" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>4 部电梯测试票</button>
          </div>
        </div>

        {step === "review" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
              <MetricCard label="解析结果" value={ticket === "standard" ? "105 件" : "88 件"} detail={ticket === "standard" ? "137 行明细" : "88 行测试数据"} />
              <MetricCard label="预计确认量" value={`${pendingCount} 项待处理`} detail={`约 ${Math.max(1, Math.ceil(pendingIssues.length / 3))} 分钟`} />
              <MetricCard label="阻断项" value={`${blockingCount} 项`} detail="必须处理完才能进入下一步" tone={blockingCount > 0 ? "danger" : "success"} />
              <MetricCard label="已自动通过" value="87 件" detail="高置信度 · 可按类别抽查" tone="success" />
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button type="button" onClick={() => setViewMode("issues")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${viewMode === "issues" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>按需要处理</button>
                <button type="button" onClick={() => setViewMode("rows")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${viewMode === "rows" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>按原表行号查看</button>
              </div>
              <button type="button" className="text-xs font-bold text-blue-600 hover:underline">抽查 5 件高置信度数据</button>
            </div>

            {viewMode === "issues" ? (
              <div className="grid grid-cols-1 lg:grid-cols-[224px_minmax(0,1fr)] gap-5 items-start">
                <aside className="lg:sticky lg:top-20 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <div className="px-2 py-2 text-xs font-bold text-slate-400">问题类型</div>
                  <div className="space-y-1">
                    {initialIssues.map((item) => {
                      const active = pendingIssues.some((pending) => pending.type === item.type);
                      return (
                        <a key={item.type} href={`#issue-${item.id}`} className="block rounded-lg px-2.5 py-2 hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            {item.severity === "blocking" && active ? <span className="w-2 h-2 rounded-full bg-red-500" /> : <CheckCircle2 size={14} className={active ? "text-slate-300" : "text-green-500"} />}
                            <span className={`text-xs font-bold ${active ? "text-slate-700" : "text-slate-400"}`}>{item.type}</span>
                            <span className="ml-auto text-[10px] font-black text-slate-400">{active ? item.count : 0}</span>
                          </div>
                          <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${active ? "bg-blue-500 w-1/4" : "bg-green-500 w-full"}`} /></div>
                        </a>
                      );
                    })}
                  </div>
                </aside>

                <div className="space-y-4">
                  {groupedIssues.map(({ type, issue }) => {
                    const open = openGroups.includes(type);
                    return (
                      <section key={issue.id} id={`issue-${issue.id}`} className="scroll-mt-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => setOpenGroups((items) => items.includes(type) ? items.filter((item) => item !== type) : [...items, type])} className="flex items-center gap-2 min-w-0">
                            {open ? <ChevronDown size={17} className="text-slate-400" /> : <ChevronRight size={17} className="text-slate-400" />}
                            <span className="font-black text-sm text-slate-800">{type}</span>
                            <span className="text-[11px] font-bold rounded-md bg-slate-100 text-slate-500 px-2 py-1">{issue.count} 件</span>
                          </button>
                          <div className="ml-auto flex gap-2">
                            <button type="button" onClick={() => setDrawerIssue(issue)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600">批量修改</button>
                            <button type="button" onClick={() => acceptAll(type)} className="px-3 py-2 rounded-lg bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100">全部接受</button>
                          </div>
                        </div>
                        {open && <div className="p-4 pt-0"><ReviewCard issue={issue} onResolve={resolveIssue} /></div>}
                      </section>
                    );
                  })}

                  {pendingIssues.length === 0 && (
                    <div className="bg-white border border-green-200 rounded-2xl p-10 text-center">
                      <CheckCircle2 size={36} className="mx-auto text-green-500 mb-3" />
                      <h3 className="font-black text-slate-800">所有待审阅项已处理</h3>
                      <p className="text-sm text-slate-500 mt-1">可以进入装柜规则确认</p>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <button type="button" className="w-full flex items-center justify-between text-sm font-bold text-slate-600">
                      <span>已处理（{processedCount}）</span><ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">原表行</th><th className="p-3">明细品名</th><th className="p-3">规格型号</th><th className="p-3">问题</th><th className="p-3">状态</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {initialIssues.map((issue, index) => <tr key={issue.id}><td className="p-3 font-bold text-blue-600">{47 + index * 8}</td><td className="p-3 font-bold text-slate-700">{issue.cargoName}</td><td className="p-3 text-slate-500">{issue.spec}</td><td className="p-3">{issue.type}</td><td className="p-3">{pendingIssues.some((item) => item.id === issue.id) ? <span className="text-orange-600 font-bold">待处理</span> : <span className="text-green-600 font-bold">已处理</span>}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {[
                ["件数", "105 件"],
                ["总毛重", "51.8 t"],
                ["总体积", "128.6 m³"],
                ["预估柜数", "3 × 40HQ"],
                ["目的地", "上海港"],
              ].map(([label, value]) => <div key={label} className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-[11px] font-bold text-slate-400">{label}</div><div className="text-sm font-black text-slate-800 mt-1">{value}</div></div>)}
            </div>

            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
              <ShieldAlert size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-800 leading-relaxed">规则优先级：本票发运单备注 → 人工修改 → 历史规则库 → 系统推断。任何系统推断都不会自动生效，必须由人工确认。</p>
            </div>

            <section>
              <div className="flex items-center justify-between mb-3"><h2 className="text-base font-black text-slate-800">待确认（{rulesPending}）</h2><button type="button" onClick={() => setRuleStatus((current) => ({ ...current, stack: "confirmed", packing: "confirmed", oversize: "confirmed", special: "confirmed" }))} className="text-xs font-bold text-blue-600 hover:underline">按包装方式批量确认</button></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {rules.filter((rule) => rule.needsConfirmation).map((rule) => <RuleCard key={rule.id} rule={rule} status={ruleStatus[rule.id]} onStatus={(status) => setRuleStatus((current) => ({ ...current, [rule.id]: status }))} />)}
              </div>
            </section>

            <section className="mt-7">
              <h2 className="text-base font-black text-slate-800 mb-3">已自动匹配（2）</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {rules.filter((rule) => !rule.needsConfirmation).map((rule) => <RuleCard key={rule.id} rule={rule} status="confirmed" onStatus={() => undefined} />)}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="fixed bottom-0 right-0 left-[240px] z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="max-w-[1200px] mx-auto px-8 lg:px-10 py-3 flex items-center gap-3">
          {step === "review" ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                <button type="button" title="撤销" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><Undo2 size={17} /></button>
                <button type="button" title="重做" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><Redo2 size={17} /></button>
                <button type="button" onClick={() => toggleAll(true)} className="px-2 py-2 text-xs font-bold text-slate-500 hover:text-blue-600">全部展开</button>
                <button type="button" onClick={() => toggleAll(false)} className="px-2 py-2 text-xs font-bold text-slate-500 hover:text-blue-600">折叠全部</button>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-xs font-bold ${reviewBlocked ? "text-red-600" : "text-green-600"}`}>{reviewBlocked ? `还有 ${blockingCount} 项阻断项待处理` : `${processedCount} 项已确认`}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">累计操作时间 04:12</div>
              </div>
              <button type="button" disabled={reviewBlocked} onClick={() => setStep("rules")} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-[0.98]">完成审阅，进入规则确认</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep("review")} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} />返回货物审阅</button>
              <div className="ml-auto text-xs font-bold text-slate-500">{rulesPending > 0 ? `还有 ${rulesPending} 条规则待确认` : "本票规则已确认完毕"}</div>
              <button type="button" disabled={rulesPending > 0} onClick={onStartPacking} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed active:scale-[0.98]"><Sparkles size={16} className="inline mr-1.5" />应用规则并开始装箱</button>
            </>
          )}
        </div>
      </div>

      {drawerIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20">
          <button type="button" aria-label="关闭批量修改" className="absolute inset-0 cursor-default" onClick={() => setDrawerIssue(null)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-black text-slate-800">批量修改 · {drawerIssue.type}</h2><p className="text-xs text-slate-500 mt-1">将影响 {drawerIssue.count} 件同类货物</p></div>
              <button type="button" onClick={() => setDrawerIssue(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block"><span className="text-xs font-bold text-slate-600">修改字段</span><select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"><option>{drawerIssue.field}</option><option>包装方式</option><option>是否可叠</option></select></label>
              <label className="block"><span className="text-xs font-bold text-slate-600">目标值</span><input defaultValue={drawerIssue.result ?? ""} placeholder="请输入确认值" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500" /></label>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs font-medium text-blue-700">本次批量修改作为一次撤销单元，可通过底部“撤销”恢复。</div>
            </div>
            <div className="absolute bottom-0 inset-x-0 border-t border-slate-200 p-4 flex gap-2">
              <button type="button" onClick={() => setDrawerIssue(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">取消</button>
              <button type="button" onClick={() => { resolveIssue(drawerIssue.id, "modified"); setDrawerIssue(null); }} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">应用到 {drawerIssue.count} 件</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
