/**
 * [INPUT]: 依赖 React 状态、四阶段解析文案与 Lucide 图标
 * [OUTPUT]: 对外提供解析校验动画 ParsingValidationView
 * [POS]: 上传完成后、进入货物审阅前的解析过程反馈页
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from "react";
import { Check, CheckCircle2, ChevronRight, FileSpreadsheet } from "lucide-react";
import { parsingStages } from "./cargoReviewData";

export function ParsingValidationView({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current >= parsingStages.length - 1) {
          window.clearInterval(timer);
          setDone(true);
          window.setTimeout(onComplete, 800);
          return current;
        }
        return current + 1;
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-[620px] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center relative overflow-hidden">
            <FileSpreadsheet size={34} className="text-blue-600" />
            <div className="absolute inset-x-3 bottom-3 h-1.5 rounded-full bg-blue-100 overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((stage + 1) / parsingStages.length) * 100}%` }} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">正在解析并校验货物清单</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">数据逐行进入审阅表，六个关键字段依次完成校验</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsingStages.map((item, index) => {
              const completed = index < stage || done;
              const active = index === stage && !done;
              return (
                <div key={item} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${completed ? "border-green-100 bg-green-50" : active ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-slate-50"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${completed ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                    {completed ? <Check size={15} strokeWidth={3} /> : <span className="text-xs font-black">{index + 1}</span>}
                  </div>
                  <span className={`text-sm font-bold ${completed ? "text-green-700" : active ? "text-blue-700" : "text-slate-400"}`}>{item}</span>
                  {active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
              );
            })}
          </div>
          {done && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-green-500" />
              解析 105 件，其中 12 项需确认
            </div>
          )}
        </div>

        <button onClick={onComplete} className="mt-4 ml-auto flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2 py-1">
          跳过 <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
