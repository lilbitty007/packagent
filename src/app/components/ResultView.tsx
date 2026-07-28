/**
 * [INPUT]: 依赖集装箱选择、尾箱优化参数、三维装箱视图与方案对比弹窗
 * [OUTPUT]: 对外提供装柜方案总览、单柜明细与方案对比入口 ResultView
 * [POS]: components 模块中承接装柜计算结果的主展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Box as BoxIcon, Loader2, Sparkles, AlertTriangle, BarChart3, Info } from 'lucide-react';
import { Container3D } from './Container3D';
import { SolutionComparisonDialog } from './SolutionComparisonDialog';

interface ResultViewProps {
  readonly containerIds: string[];
  readonly tailOptimization: boolean;
}

function getTailContainerId(containerIds: string[]): string {
  const first = containerIds[0];
  const candidates = ['20GP', '40GP', '40HQ'];
  return candidates.find(id => id !== first) ?? '20GP';
}

const MOCK_REAL_DATA = [
  {
    id: '1', dims: '1260 X 1130 X 1200', m3: 1.71, nw: 1013, gw: 1164,
    items: [
      { spec: '1160 x 1030 x 0.30', type: 'PS SPII', pkg: '30', boxes: 12, qty: 360, nw: 303, gw: 348 },
      { spec: '1055 x 811 x 0.30', type: 'PS SPII', pkg: '40', boxes: 10, qty: 400, nw: 241, gw: 277 },
      { spec: '1040 x 800 x 0.30', type: 'PS SPII', pkg: '40', boxes: 20, qty: 800, nw: 469, gw: 539 }
    ]
  },
  {
    id: '2', dims: '1100 X 860 X 1030', m3: 0.97, nw: 938, gw: 1079,
    items: [
      { spec: '1040 x 800 x 0.30', type: 'PS SPII', pkg: '40', boxes: 40, qty: 1600, nw: 938, gw: 1079 }
    ]
  },
  {
    id: '3', dims: '1090 X 860 X 1230', m3: 1.15, nw: 1072, gw: 1232,
    items: [
      { spec: '1030 x 800 x 0.30', type: 'PS SPII', pkg: '40', boxes: 15, qty: 600, nw: 348, gw: 400 },
      { spec: '925 x 740 x 0.30', type: 'PS SPII', pkg: '50', boxes: 5, qty: 250, nw: 121, gw: 139 },
      { spec: '925 x 740 x 0.30', type: 'UV-CTP-SII', pkg: '50', boxes: 25, qty: 1250, nw: 603, gw: 693 }
    ]
  },
  {
    id: '4', dims: '1090 X 860 X 1140', m3: 1.07, nw: 1038, gw: 1194,
    items: [
      { spec: '1030 x 800 x 0.30', type: 'CTP-SL STP-SL', pkg: '40', boxes: 20, qty: 800, nw: 465, gw: 535 },
      { spec: '1030 x 790 x 0.30', type: 'CTP-SL STP-SL', pkg: '40', boxes: 25, qty: 1000, nw: 573, gw: 659 }
    ]
  },
  {
    id: '5', dims: '985 X 800 X 775', m3: 0.61, nw: 603, gw: 693,
    items: [
      { spec: '925 x 740 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 25, qty: 1250, nw: 603, gw: 693 }
    ]
  },
  {
    id: '6', dims: '985 X 800 X 700', m3: 0.55, nw: 528, gw: 607,
    items: [
      { spec: '925 x 740 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 20, qty: 1000, nw: 482, gw: 554 },
      { spec: '915 x 715 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 2, qty: 100, nw: 46, gw: 53 }
    ]
  },
  {
    id: '7', dims: '1100 X 860 X 1030', m3: 0.97, nw: 938, gw: 1079,
    items: [
      { spec: '1040 x 800 x 0.30', type: 'CTP-G STP-G', pkg: '40', boxes: 40, qty: 1600, nw: 938, gw: 1079 }
    ]
  },
  {
    id: '8', dims: '1090 X 850 X 1140', m3: 1.06, nw: 1020, gw: 1173,
    items: [
      { spec: '1030 x 790 x 0.30', type: 'CTP-G STP-G', pkg: '40', boxes: 25, qty: 1000, nw: 573, gw: 659 },
      { spec: '1030 x 770 x 0.30', type: 'CTP-G STP-G', pkg: '40', boxes: 20, qty: 800, nw: 447, gw: 514 }
    ]
  },
  {
    id: '9', dims: '1330 X 805 X 1025', m3: 1.10, nw: 958, gw: 1102,
    items: [
      { spec: '745 x 605 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 50, qty: 2500, nw: 794, gw: 913 },
      { spec: '330 x 254 x 0.25', type: 'PS SPII', pkg: '50', boxes: 15, qty: 750, nw: 41, gw: 47 },
      { spec: '320 x 260 x 0.15', type: 'PS SPII', pkg: '100', boxes: 25, qty: 2500, nw: 79, gw: 91 },
      { spec: '305 x 254 x 0.15', type: 'PS SPII', pkg: '100', boxes: 15, qty: 1500, nw: 44, gw: 51 }
    ]
  },
  {
    id: '10', dims: '1330 X 805 X 1150', m3: 1.23, nw: 1271, gw: 1462,
    items: [
      { spec: '745 x 605 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 80, qty: 4000, nw: 1271, gw: 1462 }
    ]
  },
  {
    id: '11', dims: '1330 X 805 X 1150', m3: 1.23, nw: 1270, gw: 1460,
    items: [
      { spec: '745 x 605 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 50, qty: 2500, nw: 794, gw: 913 },
      { spec: '745 x 605 x 0.30', type: 'CTP-SL STP-SL', pkg: '50', boxes: 30, qty: 1500, nw: 476, gw: 547 }
    ]
  },
  {
    id: '12', dims: '1330 X 805 X 1025', m3: 1.10, nw: 686, gw: 789,
    items: [
      { spec: '745 x 605 x 0.30', type: 'UV-CTP SUVP', pkg: '50', boxes: 20, qty: 1000, nw: 318, gw: 366 },
      { spec: '650 x 550 x 0.30', type: 'UV-CTP SUVP', pkg: '50', boxes: 20, qty: 1000, nw: 252, gw: 290 },
      { spec: '650 x 550 x 0.25', type: 'PS SPII', pkg: '50', boxes: 10, qty: 500, nw: 116, gw: 133 }
    ]
  },
  {
    id: '13', dims: '1240 X 730 X 1050', m3: 0.95, nw: 929, gw: 1068,
    items: [
      { spec: '670 x 560 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 35, qty: 1750, nw: 463, gw: 532 },
      { spec: '650 x 550 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 37, qty: 1850, nw: 466, gw: 536 }
    ]
  },
  {
    id: '14', dims: '1220 X 710 X 1075', m3: 0.93, nw: 920, gw: 1058,
    items: [
      { spec: '650 x 550 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 73, qty: 3650, nw: 920, gw: 1058 }
    ]
  },
  {
    id: '15', dims: '1220 X 710 X 900', m3: 0.78, nw: 756, gw: 869,
    items: [
      { spec: '650 x 550 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 60, qty: 3000, nw: 756, gw: 869 }
    ]
  },
  {
    id: '16', dims: '1220 X 710 X 1150', m3: 1.00, nw: 927, gw: 1066,
    items: [
      { spec: '650 x 550 x 0.30', type: 'CTP-G STP-G', pkg: '50', boxes: 80, qty: 4000, nw: 927, gw: 1066 }
    ]
  },
  {
    id: '17', dims: '1220 X 710 X 1025', m3: 0.89, nw: 811, gw: 933,
    items: [
      { spec: '650 x 550 x 0.30', type: 'CTP-SL STP-SL', pkg: '50', boxes: 70, qty: 3500, nw: 811, gw: 933 }
    ]
  },
  {
    id: '18', dims: '1040 X 585 X 1250', m3: 0.76, nw: 588, gw: 677,
    items: [
      { spec: '525 x 459 x 0.15', type: 'CTP-SL STP-SL', pkg: '100', boxes: 8, qty: 800, nw: 73, gw: 84 },
      { spec: '525 x 459 x 0.15', type: 'CTP-G STP-G', pkg: '100', boxes: 35, qty: 3500, nw: 319, gw: 367 },
      { spec: '520 x 400 x 0.15', type: 'CTP-G STP-G', pkg: '100', boxes: 20, qty: 2000, nw: 157, gw: 181 },
      { spec: '510 x 400 x 0.15', type: 'CTP-G STP-G', pkg: '100', boxes: 5, qty: 500, nw: 39, gw: 45 },
      { spec: '520 x 400 x 0.15', type: 'PS SPII', pkg: '100', boxes: 20, qty: 2000, nw: 157, gw: 181 }
    ]
  },
  {
    id: '19', dims: '600 X 550 X 1270', m3: 0.42, nw: 178, gw: 205,
    items: [
      { spec: '470 x 335 x 0.25', type: 'PS SPII', pkg: '50', boxes: 3, qty: 150, nw: 15, gw: 17 },
      { spec: '510 x 490 x 0.15', type: 'PS SPII', pkg: '100', boxes: 2, qty: 200, nw: 19, gw: 22 },
      { spec: '444 x 330 x 0.15', type: 'PS SPII', pkg: '100', boxes: 5, qty: 500, nw: 28, gw: 32 },
      { spec: '400 x 260 x 0.15', type: 'PS SPII', pkg: '100', boxes: 20, qty: 2000, nw: 79, gw: 91 },
      { spec: '381 x 254 x 0.15', type: 'PS SPII', pkg: '100', boxes: 10, qty: 1000, nw: 37, gw: 43 }
    ]
  },
  {
    id: '20', dims: '1120 X 925 X 1290', m3: 1.34, nw: 720, gw: 792,
    items: [
      { spec: '20L', type: 'CTP液 (G型)', pkg: '36Bottles', boxes: '-', qty: '720L', nw: 720, gw: 792 }
    ]
  },
  {
    id: '21', dims: '1050 X 855 X 910', m3: 0.82, nw: 480, gw: 528,
    items: [
      { spec: '20L', type: 'CTP液 (G型)', pkg: '24Bottles', boxes: '-', qty: '480L', nw: 480, gw: 528 }
    ]
  },
  {
    id: '22', dims: '1050 X 855 X 910', m3: 0.82, nw: 720, gw: 792,
    items: [
      { spec: '20L', type: 'CTP液 (G型)', pkg: '36Bottles', boxes: '-', qty: '720L', nw: 720, gw: 792 }
    ]
  }
];

const MOCK_LOOSE_ITEMS = [
  { spec: '22L', type: 'G液表面活性剂', pkg: '2Bottles', qty: '44L', nw: 44, gw: 48 }
];

const LEFT_COLUMN = [
  { id: '9+10', len: 805, color: 'mixed' },
  { id: '11+12', len: 805, color: 'mixed' },
  { id: '1+2', len: 1130, color: 'blue' },
  { id: '16+17', len: 710, color: 'green' },
  { id: '15+18', len: 710, color: 'mixed' },
  { id: '20+21', len: 925, color: 'orange' },
  { id: '19', len: 550, color: 'blue' }
];

const RIGHT_COLUMN = [
  { id: '3+5', len: 1090, color: 'mixed' },
  { id: '4+6', len: 1090, color: 'green' },
  { id: '7+8', len: 1100, color: 'green' },
  { id: '13+14', len: 1240, color: 'green' },
  { id: '22', len: 855, color: 'orange' }
];

const CONTAINER_TOTAL_LENGTH = 5898; // 20GP内长约5898mm

const LayoutBlock = ({ text, color, length }: { text: string, color: string, length: number }) => {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-100 border-blue-400 hover:bg-blue-200 text-blue-900',
    green: 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200 text-emerald-900',
    orange: 'bg-orange-100 border-orange-400 hover:bg-orange-200 text-orange-900',
    mixed: 'border-purple-400 text-purple-900 hover:opacity-90',
  };
  
  const mixedStyle = color === 'mixed' ? {
    backgroundImage: 'repeating-linear-gradient(45deg, #f3e8ff, #f3e8ff 10px, #faf5ff 10px, #faf5ff 20px)'
  } : {};
  
  const percentage = (length / CONTAINER_TOTAL_LENGTH) * 100;
  
  const isPriority = ['3+5', '4+6', '7+8', '13+14', '22'].includes(text);
  
  const palletIds = text.split('+');
  const pallets = palletIds.map(id => MOCK_REAL_DATA.find(p => p.id === id)).filter(Boolean);
  
  const totalHeight = pallets.reduce((sum, pallet) => {
    if (!pallet?.dims) return sum;
    const parts = pallet.dims.toUpperCase().split('X').map(p => p.trim());
    const h = parseInt(parts[2] || '0', 10);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);
  
  return (
    <div 
      className={`group rounded border flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm relative overflow-visible ${bgColors[color]}`}
      style={{ height: `${percentage}%`, minHeight: '24px', ...mixedStyle }}
    >
      <span className={`text-[11px] font-bold z-10 leading-none bg-white/90 px-1.5 py-0.5 rounded-sm shadow-sm backdrop-blur-sm ${isPriority ? 'text-red-600' : ''}`}>
        {text}
      </span>
      {totalHeight > 0 && (
        <span className={`text-[9px] font-medium z-10 hidden sm:block mt-0.5 bg-white/90 px-1 rounded-sm backdrop-blur-sm shadow-sm ${isPriority ? 'text-red-500' : 'text-slate-600'}`}>高度:{totalHeight}</span>
      )}

      {/* Tooltip */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:flex flex-col gap-2 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 z-[999] min-w-[240px] pointer-events-none">
        {pallets.map((pallet, i) => (
          <div key={i} className="flex flex-col gap-1 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs">托盘 {pallet?.id}</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">尺寸: {pallet?.dims}</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              {pallet?.items.map((item, j) => (
                <div key={j} className="flex justify-between items-start text-[10px]">
                  <span className="text-slate-600 font-medium truncate max-w-[130px]" title={item.type}>{item.type}</span>
                  <span className="text-blue-600 font-bold ml-2 shrink-0">{item.qty}件 ({item.boxes}箱)</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getPalletTags = (pallet: any) => {
  const types = [...new Set(pallet.items.map((i: any) => {
    if (i.type.includes('PS')) return 'PS';
    if (i.type.includes('CTP') && !i.type.includes('液')) return 'CTP';
    if (i.type.includes('液')) return '液体';
    return '其他';
  }))];
  
  const isMixed = types.length > 1 || pallet.items.length > 1;
  const isLiquid = types.includes('液体');
  const mainType = (types as string[])[0] || '未知';

  return { isMixed, isLiquid, mainType, count: pallet.items.length };
};

export function ResultView({ containerIds, tailOptimization }: ResultViewProps) {
  const [generatedContainers, setGeneratedContainers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeContainerId, setActiveContainerId] = useState<string>('overview');
  const [visMode, setVisMode] = useState<'2d' | '3d'>('2d');
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const baseIds = containerIds.length > 0 ? containerIds : ['20GP'];
  const { safeContainerIds, tailId } = useMemo(() => {
    const tid = tailOptimization ? getTailContainerId(baseIds) : null;
    return {
      safeContainerIds: tailOptimization ? [...baseIds, tid!] : baseIds,
      tailId: tid,
    };
  }, [JSON.stringify(baseIds), tailOptimization]);

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < safeContainerIds.length) {
        const newId = safeContainerIds[currentIndex];
        setGeneratedContainers(prev => [...prev, newId]);
        if (currentIndex === 0) {
          if (safeContainerIds.length === 1) {
            setActiveContainerId(newId);
          } else {
            setActiveContainerId('overview');
          }
        }
        currentIndex++;
      } else {
        setIsGenerating(false);
        clearInterval(timer);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [safeContainerIds]);

  return (
    <div className="absolute inset-0 flex flex-col p-6 md:p-8 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 overflow-hidden">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
             {isGenerating ? (
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-200/50 shrink-0">
                 <Loader2 size={26} strokeWidth={2.5} className="animate-spin" />
               </div>
             ) : (
               <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center border border-green-200/50 shrink-0">
                 <CheckCircle2 size={26} strokeWidth={2.5} />
               </div>
             )}
             <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
                  {isGenerating ? 'AI 正在为您生成装箱方案...' : '规划完成'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {isGenerating 
                    ? `已生成 ${generatedContainers.length} / ${safeContainerIds.length} 个集装箱方案` 
                    : '已为您生成最优三维装箱方案'}
                </p>
             </div>
          </div>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setComparisonOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <BarChart3 size={17} />
            方案对比
          </button>
       </div>

       {/* Container Tabs */}
       <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
         {safeContainerIds.length > 1 && (
           <button
             onClick={() => setActiveContainerId('overview')}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl border-b-2 text-sm font-bold transition-all ${
               activeContainerId === 'overview'
                 ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
                 : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
             }`}
           >
             方案总览
           </button>
         )}
         {safeContainerIds.map((id, index) => {
           const isGenerated = generatedContainers.includes(id);
           const isActive = activeContainerId === id;
           const isTailBox = tailOptimization && index === safeContainerIds.length - 1;

           return (
             <button
               key={`${id}-${index}`}
               disabled={!isGenerated}
               onClick={() => setActiveContainerId(id)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 text-sm font-medium transition-all ${
                 isActive
                   ? isTailBox
                     ? 'border-amber-400 text-amber-700 bg-amber-50/50'
                     : 'border-blue-500 text-blue-600 bg-blue-50/50'
                   : isGenerated
                     ? 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                     : 'border-transparent text-slate-400 opacity-60 cursor-not-allowed'
               }`}
             >
               {isGenerated ? <BoxIcon size={16} /> : <Loader2 size={16} className="animate-spin text-slate-400" />}
               {index + 1}# {id}
               {isTailBox && isGenerated && (
                 <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200 ml-1">
                   <Sparkles size={10} />
                   优化尾箱
                 </span>
               )}
             </button>
           );
         })}
       </div>

       {/* Main Content Area */}
       {activeContainerId === 'overview' ? (
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col gap-8 animate-in fade-in">
            {/* Global Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-xs font-medium mb-1.5">托盘总数</span>
                <span className="font-bold text-slate-800 text-2xl">22 <span className="text-sm font-medium text-slate-500">托</span></span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-xs font-medium mb-1.5">集装箱数量</span>
                <span className="font-bold text-slate-800 text-2xl">{safeContainerIds.length} <span className="text-sm font-medium text-slate-500">柜</span></span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-xs font-medium mb-1.5">总体积</span>
                <span className="font-bold text-slate-800 text-2xl">21.46 <span className="text-sm font-medium text-slate-500">m³</span></span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-xs font-medium mb-1.5">总毛重</span>
                <span className="font-bold text-slate-800 text-2xl">51.9 <span className="text-sm font-medium text-slate-500">t</span></span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
              <Info size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold text-[13px] text-amber-800 mb-1">载重预警</p>
                <p className="text-[13px] font-medium text-amber-700/90 leading-relaxed">
                  检测到 1# 柜载重 30.6t，超过标准载重 28t，未超过单柜限制 32t。当前方案满足装载约束，建议关注运输安全余量。
                </p>
              </div>
            </div>

            {/* Container List */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BoxIcon size={20} className="text-blue-500" />
                各柜装载概况
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeContainerIds.map((id, index) => {
                  const isGenerated = generatedContainers.includes(id);
                  return (
                    <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-blue-300 hover:shadow-md">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {index + 1}# {id}
                          {isGenerated && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </h4>
                        {isGenerated && (
                          <button onClick={() => setActiveContainerId(id)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            查看明细
                          </button>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-4">
                        {isGenerated ? (
                          <>
                            <div 
                              onClick={() => setActiveContainerId(id)}
                              className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 group"
                            >
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <BoxIcon size={24} className="text-blue-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-500 group-hover:text-blue-500">点击进入 2D/3D 交互视图</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-slate-50 p-2.5 rounded-lg flex flex-col justify-center">
                                <span className="text-slate-400 block mb-1">托盘数</span>
                                <span className="font-bold text-slate-700">22 托</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-lg flex flex-col justify-center">
                                <span className="text-slate-400 block mb-1">单柜载重</span>
                                <span className={`font-bold ${index === 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                                  {index === 0 ? '30.6 / 32t' : '21.3 / 32t'}
                                </span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-lg flex flex-col justify-center">
                                <span className="text-slate-400 block mb-1">体积利用率</span>
                                <span className="font-bold text-emerald-600">64.8%</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={24} className="animate-spin mb-3" />
                            <span className="text-xs font-medium">正在生成...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
         </div>
       ) : (
         <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-in fade-in">
           {/* Left pane: Visualization */}
           <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden relative shadow-sm flex flex-col min-h-[400px]">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-1 flex gap-1 shadow-sm">
                 <button 
                   onClick={() => setVisMode('2d')} 
                   className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${visMode === '2d' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                   2D 俯视排布
                 </button>
                 <button 
                   onClick={() => setVisMode('3d')} 
                   className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${visMode === '3d' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                   3D 立体渲染
                 </button>
              </div>

              <div className="flex-1 relative w-full h-full">
                {visMode === '3d' ? (
                  <Container3D key={activeContainerId} />
                ) : (
                  <div className="absolute inset-0 bg-slate-50/80 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar">
                     <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm mb-6 max-w-lg w-full">
                        <span className="flex items-center gap-1.5 font-bold text-slate-600"><div className="w-3 h-3 rounded-sm border border-blue-400 bg-blue-100"></div>PS版</span>
                        <span className="flex items-center gap-1.5 font-bold text-slate-600"><div className="w-3 h-3 rounded-sm border border-emerald-400 bg-emerald-100"></div>CTP/UV</span>
                        <span className="flex items-center gap-1.5 font-bold text-slate-600"><div className="w-3 h-3 rounded-sm border border-orange-400 bg-orange-100"></div>液体辅料</span>
                        <span className="flex items-center gap-1.5 font-bold text-slate-600"><div className="w-3 h-3 rounded-sm border border-purple-400 bg-purple-100" style={{backgroundImage: 'repeating-linear-gradient(45deg, #f3e8ff, #f3e8ff 2px, #faf5ff 2px, #faf5ff 4px)'}}></div>混装托盘</span>
                     </div>
                     
                     <div className="text-xs text-slate-400 mb-3 font-bold tracking-widest uppercase flex items-center gap-2">
                       <span className="w-8 h-[1px] bg-slate-300"></span>集装箱深处 (后部)<span className="w-8 h-[1px] bg-slate-300"></span>
                     </div>
                     
                     <div className="border-4 border-slate-400 bg-white w-[280px] h-[450px] p-2 flex gap-2.5 relative shadow-inner rounded-md shrink-0">
                       <div className="flex-1 flex flex-col justify-start gap-[2px] h-full">
                         {LEFT_COLUMN.map((block, idx) => (
                           <LayoutBlock key={idx} text={block.id} color={block.color} length={block.len} />
                         ))}
                       </div>
                       <div className="flex-1 flex flex-col justify-start gap-[2px] h-full relative">
                         {RIGHT_COLUMN.map((block, idx) => (
                           <LayoutBlock key={idx} text={block.id} color={block.color} length={block.len} />
                         ))}
                         <div className="absolute bottom-1 right-0 w-full h-[15px] bg-slate-100 border-2 border-dashed border-slate-400 text-[9px] text-slate-500 font-bold flex items-center justify-center rounded-sm" title="散件: G液表面活性剂">散件</div>
                       </div>
                     </div>
                     
                     <div className="text-xs text-slate-400 mt-4 font-bold flex flex-col items-center gap-3">
                       <span className="tracking-widest uppercase flex items-center gap-2">
                         <span className="w-8 h-[1px] bg-slate-300"></span>集装箱门 (前部)<span className="w-8 h-[1px] bg-slate-300"></span>
                       </span>
                     </div>
                  </div>
                )}
              </div>
           </div>

           {/* Right pane: Container Data & Pallets */}
           <div className="w-full md:w-[420px] lg:w-[460px] bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
             {/* Container specific Stats */}
             <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                   本柜装载概况
                 </h4>
                 <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                   20尺普柜 (20GP)
                 </span>
               </div>
               <div className="grid grid-cols-2 gap-3 text-sm">
                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-slate-400 block text-xs font-medium mb-1">本柜托盘</span>
                   <span className="font-bold text-slate-800">22 <span className="text-xs font-medium text-slate-500">托</span></span>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-slate-400 block text-xs font-medium mb-1">本柜毛重</span>
                   <span className="font-bold text-slate-800">21.3 <span className="text-xs font-medium text-slate-500">t</span></span>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-slate-400 block text-xs font-medium mb-1">体积利用率</span>
                   <span className="font-bold text-emerald-600">64.8% <span className="text-xs font-medium text-slate-500 ml-1">(21.46 m³)</span></span>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-slate-400 block text-xs font-medium mb-1">重量利用率</span>
                   <span className="font-bold text-emerald-600">76.1% <span className="text-xs font-medium text-slate-500 ml-1">(限 28t)</span></span>
                 </div>
               </div>
             </div>
             
             {/* SOP List */}
             <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col min-h-0 bg-slate-50/30">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                    装箱步骤指导
                  </h4>
                  <span className="text-xs text-slate-500 font-bold">按放置顺序</span>
                </div>
                
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 mb-5 shadow-sm">
                  <p className="text-xs text-blue-800 font-bold mb-1.5 flex items-center gap-1.5">
                    <Info size={14} /> 优先序号业务规则
                  </p>
                  <ul className="text-xs text-blue-700/80 space-y-1 pl-4 list-disc font-medium">
                    <li><span className="text-red-500 font-bold">红色序号</span> 表示集装箱受限时应优先装载的配对。</li>
                    <li>同底盘尺寸配对中，<span className="font-bold">毛重较大者优先</span>（先装重货保证稳定）。</li>
                    <li>若毛重相近，<span className="font-bold">PL 编号较小者优先</span>。</li>
                    <li>优先配对数量不超过总配对组数的 50%。</li>
                  </ul>
                </div>
                
                <div className="space-y-4 text-[13px] text-slate-600 leading-relaxed font-medium">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0">1</div>
                    <div>
                      优先装载序列：将 <b className="text-red-500">3+5</b>、<b className="text-red-500">4+6</b>、<b className="text-red-500">7+8</b>、<b className="text-red-500">13+14</b> 和 <b className="text-red-500">22</b> 置于右侧。这些组合重货居多且优先等级高，先入柜以保证整体稳定性。
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0">2</div>
                    <div>
                      常规装载序列：将 <b className="text-slate-800">9+10</b>、<b className="text-slate-800">11+12</b>、<b className="text-slate-800">1+2</b> 等置于左侧，依序并排推入。
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0">3</div>
                    <div>
                      靠门及散件收尾：液体托盘 <b className="text-slate-800">20+21</b> 置于左侧靠门处；将散件辅料填充于右侧缝隙处。
                    </div>
                  </div>
                </div>
             </div>
           </div>
         </div>
       )}
      <SolutionComparisonDialog open={comparisonOpen} onClose={() => setComparisonOpen(false)} />
    </div>
  );
}
