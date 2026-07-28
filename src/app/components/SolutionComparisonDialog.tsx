/**
 * [INPUT]: 依赖 React 状态、文件选择能力与项目现有 Tailwind/lucide 视觉原语
 * [OUTPUT]: 对外提供人工方案上传、解析动画和箱件号对比结果弹窗
 * [POS]: components 模块中挂载于规划完成页的方案对比交互组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from "react";
import { BarChart3, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

type ComparePhase = "upload" | "parsing" | "result";

const PARSING_STAGES = ["读取人工方案", "识别箱件号", "对齐系统方案", "生成对比评分"] as const;
const COMPARISON_ROWS = [
  { container: "1 号柜", manualRange: "1/1–52/1", manualCount: 52, systemRange: "1/1–55/1", systemCount: 55, delta: "+3 件" },
  { container: "2 号柜", manualRange: "53/2–105/2", manualCount: 53, systemRange: "56/2–105/2", systemCount: 50, delta: "-3 件" },
] as const;

export function SolutionComparisonDialog({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ComparePhase>("upload");
  const [fileName, setFileName] = useState("");
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!open || phase !== "parsing") return;
    const stageTimer = window.setInterval(() => {
      setStageIndex((current) => Math.min(current + 1, PARSING_STAGES.length - 1));
    }, 800);
    const finishTimer = window.setTimeout(() => {
      window.clearInterval(stageTimer);
      setPhase("result");
    }, 3600);
    return () => {
      window.clearInterval(stageTimer);
      window.clearTimeout(finishTimer);
    };
  }, [open, phase]);

  const closeDialog = () => {
    setPhase("upload");
    setFileName("");
    setStageIndex(0);
    onClose();
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(xlsx?|XLSX?)$/.test(file.name)) {
      toast.error("请上传 .xls 或 .xlsx 格式的人工方案");
      return;
    }
    setFileName(file.name);
    setStageIndex(0);
    setPhase("parsing");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeDialog(); }}>
      <DialogContent className="z-[100] max-w-3xl gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 pr-14">
          <DialogTitle className="text-lg font-black text-slate-800">方案对比</DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-500">上传人工排柜方案，按箱件号核对每柜排布数量</DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {phase === "upload" && (
            <>
              <input ref={inputRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
              <button type="button" onClick={() => inputRef.current?.click()} className="group w-full rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 py-12 text-center hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-white text-blue-500 shadow-sm transition-transform group-hover:scale-105"><UploadCloud size={28} /></span>
                <span className="mt-4 block text-sm font-black text-slate-800">上传人工排柜方案</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">支持 .xls / .xlsx，需包含人工填写的箱件号</span>
              </button>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                对比口径：读取 <b className="text-slate-700">X/Y</b> 中的柜号 Y，汇总人工方案与系统方案在每个柜中的货物件数。
                <span className="mt-1 block text-slate-400">原型演示：仅识别文件名，不读取或上传文件内容；对比结果来自内置 Mock 数据。</span>
              </div>
            </>
          )}

          {phase === "parsing" && (
            <div className="py-8 text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2 size={42} className="absolute animate-spin text-blue-500" />
                <FileSpreadsheet size={20} className="animate-pulse text-blue-700" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-800">人工排柜方案解析对比中</h3>
              <p className="mt-1 truncate text-xs font-medium text-slate-500">{fileName}</p>
              <div className="mx-auto mt-7 grid max-w-xl grid-cols-4 gap-2">
                {PARSING_STAGES.map((stage, index) => (
                  <div key={stage} className={`rounded-lg border px-2 py-3 text-[11px] font-bold transition-colors ${index <= stageIndex ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400"}`}>
                    {index < stageIndex ? <CheckCircle2 size={14} className="mx-auto mb-1 text-green-500" /> : <span className="mx-auto mb-1 block h-3.5 w-3.5 rounded-full border-2 border-current" />}
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm"><BarChart3 size={24} /></div>
                <div>
                  <div className="text-xs font-bold text-green-700">综合装载评分</div>
                  <div className="mt-1 text-2xl font-black text-slate-800">系统方案优于人工 <span className="text-green-600">5%</span></div>
                  <p className="mt-1 text-xs font-medium text-slate-500">柜数一致，系统方案在载重均衡与尾柜空间利用上更优。</p>
                </div>
                <div className="shrink-0 sm:ml-auto sm:text-right">
                  <div className="text-[11px] font-bold text-slate-400">箱件号覆盖</div>
                  <div className="mt-1 whitespace-nowrap text-lg font-black text-slate-800">105 / 105 件</div>
                </div>
              </div>
              <div className="text-[11px] font-bold text-amber-600">原型演示结果 · 当前评分与排柜差异来自内置 Mock 数据</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-bold text-slate-400">人工方案</div><div className="mt-1 text-xl font-black text-slate-800">2 柜</div></div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4"><div className="text-xs font-bold text-blue-600">系统方案</div><div className="mt-1 text-xl font-black text-slate-800">2 柜</div></div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">柜号</th><th className="p-3">人工箱件号 / 件数</th><th className="p-3">系统箱件号 / 件数</th><th className="p-3 text-right">差异</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {COMPARISON_ROWS.map((row) => (
                      <tr key={row.container}>
                        <td className="p-3 font-black text-slate-700">{row.container}</td>
                        <td className="p-3 text-slate-600">{row.manualRange} <b className="ml-1 text-slate-800">{row.manualCount} 件</b></td>
                        <td className="p-3 text-slate-600">{row.systemRange} <b className="ml-1 text-blue-700">{row.systemCount} 件</b></td>
                        <td className="p-3 text-right font-black text-blue-600">{row.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] leading-5 text-slate-400">评分口径：箱件号覆盖完整度、柜数、单柜载重均衡度与尾柜空间利用率的综合比较。</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
