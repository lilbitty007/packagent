/**
 * [INPUT]: 依赖 React 状态、路由位置、货物审阅工作台与 ResultView 结果组件
 * [OUTPUT]: 对外提供开始装箱页面 StartPackingView
 * [POS]: views 模块中的装箱任务入口，负责清单上传、计算状态与结果切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useRef } from "react";
import { UploadCloud, Check, Download, FileSpreadsheet, X, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "react-router";
import { ResultView } from "../components/ResultView";
import { CargoReviewWorkspace } from "./CargoReviewWorkspace";
import { ParsingValidationView } from "./ParsingValidationView";

export function StartPackingView() {
  const location = useLocation();
  const [isGenerated, setIsGenerated] = useState(location.state?.isGenerated || false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>(["20GP"]);
  const [tailOptimization, setTailOptimization] = useState(true);

  // New states for upload and calculation
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'parsing' | 'reviewing' | 'calculating'>('idle');
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
      setUploadStatus('parsing');
    }
  };

  if (isGenerated) {
    // Show the result
    return (
      <div className="-m-8 lg:-m-10 h-screen flex flex-col relative">
         <ResultView containerIds={selectedContainers} tailOptimization={tailOptimization} />
      </div>
    );
  }

  if (uploadStatus === 'parsing') {
    return <ParsingValidationView onComplete={() => setUploadStatus('reviewing')} />;
  }

  if (uploadStatus === 'reviewing') {
    return (
      <CargoReviewWorkspace
        onBack={() => setUploadStatus('uploaded')}
        onStartPacking={() => setUploadStatus('calculating')}
      />
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
