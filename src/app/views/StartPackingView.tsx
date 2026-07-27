import { useState, useEffect, useRef } from "react";
import { UploadCloud, ChevronRight, ChevronDown, Check, Download, Info, FileSpreadsheet, X, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router";
import { ResultView } from "../components/ResultView";

export function StartPackingView() {
  const location = useLocation();
  const [isGenerated, setIsGenerated] = useState(location.state?.isGenerated || false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>(["20GP"]);
  const [tailOptimization, setTailOptimization] = useState(true);
  
  const [strategy, setStrategy] = useState("重量优先");
  const [isolationRules, setIsolationRules] = useState("UV,PS;PS,CTP");

  // New states for upload and calculation
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'calculating'>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadStatus === 'uploading') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setUploadStatus('uploaded');
            return 100;
          }
          return p + Math.floor(Math.random() * 15) + 5; // Random jump 5-20%
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [uploadStatus]);

  useEffect(() => {
    if (uploadStatus === 'calculating') {
      const timer = setTimeout(() => {
        setIsGenerated(true);
        setUploadStatus('idle'); // reset for back navigation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadStatus('uploading');
      setProgress(0);
    }
    // Clear input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadStatus('idle');
    setProgress(0);
    setFileName("");
  };

  const handleGenerate = () => {
    if (uploadStatus === 'uploaded') {
      setUploadStatus('calculating');
    }
  };

  if (isGenerated) {
    // Show the result
    return (
      <div className="-m-8 lg:-m-10 h-screen flex flex-col relative">
         <ResultView 
           containerIds={selectedContainers}
           tailOptimization={tailOptimization}
           onReset={() => setIsGenerated(false)}
         />
      </div>
    );
  }

  if (uploadStatus === 'calculating') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 mt-10">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 relative">
          <Loader2 size={40} className="text-blue-600 animate-spin absolute" />
          <Sparkles size={20} className="text-blue-400 absolute animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">PackAgent 正在计算最优方案</h2>
        <p className="text-sm font-medium text-slate-500 animate-pulse">正在进行 3D 空间推演并应用您的装箱规则...</p>
      </div>
    );
  }

  const parsedRulesCount = isolationRules.split(";").map(r => r.trim()).filter(r => r.length > 0 && r.includes(",")).length;

  return (
    <div className="max-w-4xl pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">开始装箱</h1>
        <p className="text-sm font-medium text-slate-500">上传订单，一键生成装箱方案</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        
        {/* Upload Area */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".xls,.xlsx" 
          onChange={handleFileChange} 
        />
        {uploadStatus === 'idle' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-200 bg-[#fafbff] rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 group-hover:shadow transition-all">
              <UploadCloud size={28} className="text-blue-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">点击或将 EXCEL 文件拖拽至此处</h3>
            <p className="text-xs font-medium text-slate-500 flex items-center justify-center gap-2">
              支持 .xls / .xlsx 格式 · 
              <span className="text-blue-600 font-bold hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Download size={14} /> 下载标准模板
              </span>
            </p>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="border-2 border-blue-200 bg-[#fafbff] rounded-xl p-8 transition-all relative overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={24} strokeWidth={2} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800">{fileName}</span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'uploaded' && (
          <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6 transition-all flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 relative">
                <FileSpreadsheet size={24} strokeWidth={2} />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-green-50 animate-in zoom-in-0 duration-300">
                  <Check size={10} strokeWidth={4} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-0.5">{fileName}</h3>
                <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                  上传成功
                </p>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="重新上传"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Rule Summary */}
        <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-100 rounded-xl p-4 my-6">
          <span className="text-blue-700 font-bold text-sm shrink-0 flex items-center gap-1.5">
            <Check size={16} strokeWidth={3} /> 当前企业规则
          </span>
          <span className="text-slate-700 text-sm font-medium truncate">
            川字托盘 · 自动新增尺寸 · 尾箱优化 · 20GP · 限重 26t
          </span>
          {localStorage.getItem("userRole") !== "user" && (
            <Link to="/config" className="ml-auto text-blue-600 font-bold text-sm hover:underline whitespace-nowrap">
              去调整 ›
            </Link>
          )}
        </div>

        {/* Temporary Tweaks */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button 
            onClick={() => setTweaksOpen(!tweaksOpen)}
            className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {tweaksOpen ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
              本次临时调整 <span className="text-slate-400 font-medium ml-1">（仅对这一单生效，不保存到企业规则）</span>
            </div>
            {!tweaksOpen && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                已设: {strategy} / {parsedRulesCount}条隔离
              </span>
            )}
          </button>
          
          {tweaksOpen && (
            <div className="p-5 pt-2 border-t border-slate-100 bg-white space-y-5">
              
              {/* Strategy */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">装载优先策略</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { n: "重量优先", d: "重货置底" },
                    { n: "均衡分配", d: "各柜均匀" },
                    { n: "尺寸匹配优先", d: "按尺寸分组" }
                  ].map(opt => (
                    <div 
                      key={opt.n}
                      onClick={() => setStrategy(opt.n)}
                      className={`border-2 rounded-xl p-3 cursor-pointer transition-colors ${
                        strategy === opt.n ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <b className={`text-[13px] block ${strategy === opt.n ? "text-blue-800" : "text-slate-700"}`}>
                        {opt.n} {strategy === opt.n && "✓"}
                      </b>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{opt.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Isolation Rules */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">品类隔离规则</div>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  rows={2}
                  value={isolationRules}
                  onChange={(e) => setIsolationRules(e.target.value)}
                  placeholder="例如: UV,PS;PS,CTP"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-slate-400 font-medium">
                    多组用分号隔开。此规则仅本次运算生效。
                  </p>
                  {isolationRules && (
                    <div className="text-[11px] font-bold text-blue-600">
                      已识别 {parsedRulesCount} 条规则
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={uploadStatus !== 'uploaded'}
          className={`w-full mt-6 font-bold text-[15px] py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
            uploadStatus === 'uploaded' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {uploadStatus === 'uploaded' && <Sparkles size={18} />}
          生成方案
        </button>
      </div>
    </div>
  );
}