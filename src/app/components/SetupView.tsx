import { useState, useRef } from 'react';
import { Upload, ArrowRight, FileSpreadsheet, Info, X, Check, Zap, ToggleLeft, ToggleRight, Download, Package } from 'lucide-react';
import { toast } from 'sonner';

const CONTAINERS = [
  { id: '20GP', name: '20尺普柜 (20GP)', l: 5.898, w: 2.352, h: 2.393, vol: 33.1, weight: 28 },
  { id: '40GP', name: '40尺普柜 (40GP)', l: 12.032, w: 2.352, h: 2.393, vol: 67.5, weight: 26 },
  { id: '40HQ', name: '40尺高柜 (40HQ)', l: 12.032, w: 2.352, h: 2.698, vol: 76.2, weight: 26 },
  { id: '45HQ', name: '45尺高柜 (45HQ)', l: 13.556, w: 2.352, h: 2.698, vol: 86.0, weight: 29 },
  { id: '20OT', name: '20尺开顶柜 (20OT)', l: 5.898, w: 2.352, h: 2.348, vol: 32.5, weight: 28 },
  { id: '40OT', name: '40尺开顶柜 (40OT)', l: 12.032, w: 2.352, h: 2.348, vol: 66.4, weight: 26 },
  { id: 'CUSTOM', name: '自定义尺寸', l: 0, w: 0, h: 0, vol: 0, weight: 0 }
];

const PACKING_RULES = [
  { id: 'rule1', label: '重不压轻', desc: '较重的货物不能放在较轻的货物上方' },
  { id: 'rule5', label: '重心居中低位', desc: '装载时优先保证集装箱整体重心居中且偏低' },
  { id: 'rule2', label: '相同类型相邻摆放', desc: '同型号或同批次的货物优先集中放置' },
  { id: 'rule4', label: '液体独立堆叠', desc: '液体托盘只能与液体托盘上下堆叠，不可与其他品类混叠' },
  { id: 'rule6', label: '允许水平旋转', desc: '允许货物进行水平90°旋转以充分利用集装箱空间' }
];

const PALLET_TYPES = [
  { id: 'chuan', name: '川字托盘' },
  { id: 'tian', name: '田字托盘' }
];

export function SetupView({ onStart }: { onStart: (containerIds: string[], tailOptimization: boolean) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isolationRules, setIsolationRules] = useState('');
  const [loadPriority, setLoadPriority] = useState<'weight' | 'balance' | 'size'>('weight');
  const [singleContainerWeightLimit, setSingleContainerWeightLimit] = useState<number>(26000);
  const [containerIds, setContainerIds] = useState<string[]>([CONTAINERS[0].id]);
  const [customDims, setCustomDims] = useState({ l: '', w: '', h: '', weight: '' });
  const [tailOptimization, setTailOptimization] = useState(true);
  const [autoAddNewSize, setAutoAddNewSize] = useState(true);
  const [selectedPalletTypes, setSelectedPalletTypes] = useState<string[]>(['chuan']);
  const [thicknessMapping, setThicknessMapping] = useState({ t030: 0.261, t025: 0.24, t015: 0.14 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      toast.success('货物清单上传成功，已准备就绪');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles([e.dataTransfer.files[0]]);
      toast.success('货物清单上传成功，已准备就绪');
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
  };

  const toggleContainer = (id: string) => {
    setContainerIds(prev => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter(c => c !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const togglePalletType = (typeId: string) => {
    setSelectedPalletTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.length > 1 ? prev.filter(id => id !== typeId) : prev;
      }
      return [...prev, typeId];
    });
  };

  const downloadTemplate = () => {
    const csvContent = "装箱单行号(PL NO.),产品类型(PRODUCT),版材长度(SIZE-L),版材宽度(SIZE-W),版材厚度(SIZE-T),每包张数(PACKET),箱数(BOX),总张数(SHEETS),客户名称(CUSTOMER)\n1,UV-CTP,770,1030,0.30,50,40,2000,客户A\n2,CTP,800,1000,0.15,40,50,2000,客户B";
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '装箱导入模板.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('模板下载成功');
  };

  const selectedNonCustomContainers = CONTAINERS.filter(c => containerIds.includes(c.id) && c.id !== 'CUSTOM');

  const handleStartWithToast = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
        loading: '正在解析货物清单并应用装箱规则...',
        success: '数据加载成功，即将进入3D规划',
        error: '解析失败'
      }
    );
    setTimeout(() => {
      onStart(containerIds, tailOptimization);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 max-w-5xl mx-auto w-full relative">
       {/* 背景修饰 */}
       <div className="fixed inset-0 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50/20 to-white -z-10 pointer-events-none" />
       
       <div className="mb-10 text-center relative z-10 pt-4">
         <div className="flex items-center justify-center gap-4 mb-4">
           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
             <Package size={24} className="stroke-[2.5]" />
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">智能装箱规划系统</h1>
         </div>
         <p className="text-slate-500 text-sm font-medium">上传您的货物明细表格，AI将为您生成最佳三维装载方案</p>
       </div>
       
       <div className="w-full space-y-6 relative z-10">
          {/* 第一步：上传货物清单 */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20 flex-shrink-0">1</div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">上传货物清单</h2>
            </div>
            
            {files.length === 0 ? (
              <div 
                className="rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[200px] border-2 border-dashed bg-slate-50/50 border-slate-300/80 hover:bg-blue-50/50 hover:border-blue-400 group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    <Upload size={28} className="stroke-[1.5]" />
                  </div>
                  <p className="text-base font-semibold text-slate-700 mb-1.5">点击或将 EXCEL 文件拖拽至此处</p>
                  <p className="text-xs text-slate-400 mb-4">支持 .xls, .xlsx 格式</p>
                  <div className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-100/50 shadow-sm">
                    <span className="opacity-80">首次使用？先下载标准模板，按格式填写后上传，系统才能正确识别货物信息。</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 rounded-lg font-medium mt-1 w-full transition-colors"
                    >
                      <Download size={14} />
                      下载标准模板
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-blue-100/50 flex-shrink-0">
                    <FileSpreadsheet size={28} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1.5 line-clamp-1">{files[0].name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check size={12} className="stroke-[3]" /> 已就绪
                      </span>
                      <span className="text-[11px] text-slate-400">等待解析规划</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors shadow-sm"
                  >
                    重新上传
                  </button>
                  <button 
                    onClick={removeFile}
                    className="p-2.5 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-colors shadow-sm"
                    title="移除文件"
                  >
                    <X size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                </div>
              </div>
            )}
          </div>

          {/* 第二步：打托规则配置 */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20 flex-shrink-0">2</div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">打托规则配置</h2>
            </div>

            <div className="space-y-4">
              {/* 2.1 托盘配置 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                    托盘选择��
                  </h3>
                  <button
                    onClick={() => setAutoAddNewSize(v => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all w-fit shadow-sm ${
                      autoAddNewSize
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {autoAddNewSize
                      ? <ToggleRight size={18} className="text-blue-500" />
                      : <ToggleLeft size={18} className="text-slate-400" />
                    }
                    自动新增尺寸
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${autoAddNewSize ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {autoAddNewSize ? '已开启' : '已关闭'}
                    </span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PALLET_TYPES.map(type => {
                    const isSelected = selectedPalletTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        onClick={() => togglePalletType(type.id)}
                        className={`relative group p-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50/30 border-blue-400 shadow-sm text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-500 text-white border-transparent' : 'border border-slate-300 bg-slate-50 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </div>
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2.2 厚度映射 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  厚度映射 <span className="text-xs text-slate-400 font-medium ml-1">(用于真实重量计算)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: '0.30 mm', key: 't030' },
                    { label: '0.25 mm', key: 't025' },
                    { label: '0.15 mm', key: 't015' }
                  ].map(tier => (
                    <div key={tier.key} className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                      <span className="text-xs text-slate-500 mb-2.5 font-medium flex items-center justify-between">
                        <span>标称厚度</span>
                        <strong className="text-slate-800 text-sm ml-0.5">{tier.label}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">实际厚度:</span>
                        <input
                          type="number"
                          step="0.001"
                          value={thicknessMapping[tier.key as keyof typeof thicknessMapping]}
                          onChange={e => setThicknessMapping({...thicknessMapping, [tier.key]: Number(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-bold text-blue-700 outline-none focus:border-blue-400 focus:bg-white transition-all text-center"
                        />
                        <span className="text-xs text-slate-400 font-medium">mm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2.3 品类隔离 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  品类隔离规则
                </h3>
                <input 
                  type="text" 
                  placeholder="例如：UV,PS;PS,CTP (不输入则无限制)" 
                  value={isolationRules} 
                  onChange={(e) => setIsolationRules(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                />
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  不填则无限制。输入格式示例：<code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[11px] mx-1 shadow-sm">UV,PS;PS,CTP</code> 
                  表示UV与PS不能混托，PS与CTP不能混托。多组规则请用分号隔开。
                </p>
              </div>
            </div>
          </div>

          {/* 第三步：装箱规则配置 */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20 flex-shrink-0">3</div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">装箱规则配置</h2>
            </div>

            <div className="space-y-4">
              {/* 3.1 装载优先策略 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  装载优先策略
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'weight', name: '重量优先', desc: '优先装载重量较大的托盘组合，重货置底' },
                    { id: 'balance', name: '均衡分配', desc: '各柜重量均匀分布' },
                    { id: 'size', name: '尺寸匹配优先', desc: '优先按托盘尺寸相近原则分组入柜' }
                  ].map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => setLoadPriority(strategy.id as any)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        loadPriority === strategy.id 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50/30 border-blue-400 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-bold ${loadPriority === strategy.id ? 'text-blue-700' : 'text-slate-700'}`}>
                          {strategy.name}
                        </span>
                        {loadPriority === strategy.id && <Check size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{strategy.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3.2 集装箱设置 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  集装箱与载重设置
                </h3>
                
                {/* 箱型选择 */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-500 mb-2.5">选择可用规格 (可多选)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CONTAINERS.map(c => {
                      const isSelected = containerIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleContainer(c.id)}
                          className={`relative py-3 px-4 rounded-xl border transition-all text-sm font-bold ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50/30 border-blue-400 text-blue-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          {c.name}
                          {isSelected && (
                            <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <Check size={12} className="text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* 选中规格展示 */}
                {selectedNonCustomContainers.length > 0 && (
                  <div className="flex flex-col gap-3 mb-5">
                    {selectedNonCustomContainers.map(container => (
                      <div key={container.id} className="bg-gradient-to-r from-blue-50/50 to-white border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-bold w-full sm:w-auto min-w-[120px]">
                          <Info size={16} className="text-blue-500" /> {container.name.split(' ')[0]}
                        </div>
                        <div className="flex gap-5">
                          <div><span className="text-slate-400 font-medium">长</span> <span className="font-bold text-slate-700 ml-1">{container.l}m</span></div>
                          <div><span className="text-slate-400 font-medium">宽</span> <span className="font-bold text-slate-700 ml-1">{container.w}m</span></div>
                          <div><span className="text-slate-400 font-medium">高</span> <span className="font-bold text-slate-700 ml-1">{container.h}m</span></div>
                        </div>
                        <div className="flex gap-5 sm:ml-auto w-full sm:w-auto">
                          <div><span className="text-slate-400 font-medium">容积</span> <span className="font-bold text-blue-700 ml-1">{container.vol}m³</span></div>
                          <div><span className="text-slate-400 font-medium">载重</span> <span className="font-bold text-blue-700 ml-1">{container.weight}t</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 自定义参数 */}
                {containerIds.includes('CUSTOM') && (
                  <div className="bg-gradient-to-r from-blue-50/50 to-white border border-blue-100 rounded-xl p-4 sm:p-5 flex flex-col gap-4 text-sm mb-5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold"><Info size={16} className="text-blue-500" /> 自定义内部参数</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-500 text-xs font-medium mb-1.5">内部长度 (m)</label>
                        <input
                          type="number"
                          placeholder="e.g. 5.9"
                          value={customDims.l}
                          onChange={e => setCustomDims({...customDims, l: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-xs font-medium mb-1.5">内部宽度 (m)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2.35"
                          value={customDims.w}
                          onChange={e => setCustomDims({...customDims, w: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-xs font-medium mb-1.5">内部高度 (m)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2.39"
                          value={customDims.h}
                          onChange={e => setCustomDims({...customDims, h: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-xs font-medium mb-1.5">最大载重 (t)</label>
                        <input
                          type="number"
                          placeholder="e.g. 28"
                          value={customDims.weight}
                          onChange={e => setCustomDims({...customDims, weight: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 重量限��与尾箱 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">单柜重量限制 (kg)</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">设置单柜最大毛重，超限分柜</p>
                    </div>
                    <input
                      type="number"
                      value={singleContainerWeightLimit}
                      onChange={(e) => setSingleContainerWeightLimit(Number(e.target.value))}
                      className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 text-right transition-all"
                    />
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">尾箱自动优化</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">根据装载效率自动择优规格</p>
                    </div>
                    <button
                      onClick={() => setTailOptimization(v => !v)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all flex-shrink-0 shadow-sm ${
                        tailOptimization
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {tailOptimization
                        ? <ToggleRight size={20} className="text-blue-500" />
                        : <ToggleLeft size={20} className="text-slate-400" />
                      }
                      {tailOptimization ? '已启用' : '已关闭'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3.3 内置规则 */}
              <div className="bg-white/60 rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  内置装箱规则 <span className="text-xs text-slate-400 font-medium ml-1">(系统默认执行)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PACKING_RULES.map(rule => (
                    <div key={rule.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                      <div className="mt-0.5 text-blue-500 flex-shrink-0 bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Zap size={16} className="fill-current opacity-30" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-1.5 leading-none group-hover:text-blue-700 transition-colors">{rule.label}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
       </div>

       <div className="mt-10 mb-8 flex justify-center relative z-10">
          <button 
             onClick={handleStartWithToast}
             disabled={files.length === 0}
             className={`flex items-center gap-2 px-14 py-4 rounded-2xl text-base font-bold transition-all duration-300 shadow-xl ${
               files.length > 0
                 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:-translate-y-1 shadow-blue-500/25 border border-transparent cursor-pointer' 
                 : 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
             }`}
          >
             开始智能规划 <ArrowRight size={20} strokeWidth={2.5} />
          </button>
       </div>
    </div>
  );
}