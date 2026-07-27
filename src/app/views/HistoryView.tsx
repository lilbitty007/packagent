import { FileText } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export function HistoryView() {
  const histories = [
    { id: "PL-20260620-001", meta: "22托 / 2柜", time: "2026-06-20 14:32", rule: "重量优先", util: "64.8%" },
    { id: "PL-20260618-003", meta: "18托 / 1柜", time: "2026-06-18 09:10", rule: "重量优先", util: "71.2%" },
    { id: "PL-20260615-007", meta: "25托 / 2柜", time: "2026-06-15 16:45", rule: "均衡分配", util: "68.0%" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">历史方案</h1>
        <p className="text-sm font-medium text-slate-500">历次生成的方案与打包明细，可随时查看和导出</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {histories.map((h, i) => (
          <div key={i} className="flex items-center gap-5 p-4 border border-slate-200 rounded-xl bg-white mb-3 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-slate-800 mb-0.5">{h.id} <span className="ml-3 tracking-wide">{h.meta}</span></h4>
              <p className="text-[13px] font-medium text-slate-500">
                {h.time} · <span className="text-slate-700">{h.rule}</span> · 体积利用率 <span className="text-emerald-600 font-bold">{h.util}</span>
              </p>
            </div>
            <div className="flex gap-4 items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <Link to="/" state={{ isGenerated: true }} className="text-sm font-bold text-blue-600 hover:underline">查看</Link>
              <button onClick={() => toast.success(`已导出「${h.id}」的打包明细`)} className="text-sm font-bold text-slate-500 hover:text-blue-600">导出明细</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}