/**
 * [INPUT]: 依赖 React 状态、路由导航、消息提示与装箱规则数据
 * [OUTPUT]: 对外提供企业装箱规则页面 RulesConfigView
 * [POS]: views 模块中的企业规则配置页，只维护集装箱规格与装箱约束
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function RulesConfigView() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userRole") === "user") {
      navigate("/");
    }
  }, [navigate]);

  const [tailToggle, setTailToggle] = useState(true);
  const [containers, setContainers] = useState([
    { id: '1', name: '20尺普柜 (20GP)', l: '5.89', w: '2.35', h: '2.39', vol: '33.1', payload: '28000', limit: '26000', isCustom: false },
    { id: '2', name: '40尺普柜 (40GP)', l: '12.03', w: '2.35', h: '2.39', vol: '67.5', payload: '28000', limit: '26000', isCustom: false },
    { id: '3', name: '40尺高柜 (40HQ)', l: '12.03', w: '2.35', h: '2.69', vol: '76.2', payload: '28000', limit: '26000', isCustom: false },
    { id: '4', name: '45尺高柜 (45HQ)', l: '13.55', w: '2.35', h: '2.69', vol: '86.0', payload: '28000', limit: '26000', isCustom: false },
    { id: '5', name: '20尺开顶柜 (20OT)', l: '5.89', w: '2.31', h: '2.31', vol: '31.5', payload: '28000', limit: '26000', isCustom: false },
    { id: '6', name: '40尺开顶柜 (40OT)', l: '12.01', w: '2.33', h: '2.31', vol: '64.0', payload: '28000', limit: '26000', isCustom: false }
  ]);
  const [selectedContainerIds, setSelectedContainerIds] = useState(['1', '3']);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rulesConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tailToggle !== undefined) setTailToggle(parsed.tailToggle);
        if (parsed.containers) setContainers(parsed.containers);
        if (parsed.selectedContainerIds) setSelectedContainerIds(parsed.selectedContainerIds);
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const handleSave = () => {
    if (selectedContainerIds.length === 0) {
      toast.error("至少保留一种集装箱类型");
      return;
    }

    const config = {
      tailToggle, containers, selectedContainerIds
    };
    localStorage.setItem("rulesConfig", JSON.stringify(config));
    toast.success("已保存为「强邦新材料」默认规则");
  };

  // Container Handlers
  const toggleContainerId = (id: string) => {
    if (selectedContainerIds.includes(id)) {
      if (selectedContainerIds.length > 1) {
        setSelectedContainerIds(selectedContainerIds.filter(x => x !== id));
      } else {
        toast.error("至少保留一种集装箱类型");
      }
    } else {
      setSelectedContainerIds([...selectedContainerIds, id]);
    }
  };

  const addCustomContainer = () => {
    const newId = Date.now().toString();
    setContainers([...containers, { 
      id: newId, name: '自定义柜型', l: '', w: '', h: '', vol: '', payload: '', limit: '26000', isCustom: true 
    }]);
    setSelectedContainerIds([...selectedContainerIds, newId]);
  };

  const updateContainer = (id: string, field: string, value: string) => {
    setContainers(containers.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCustomContainer = (id: string) => {
    if (confirm("确定要删除此自定义柜型吗？")) {
      setContainers(containers.filter(c => c.id !== id));
      setSelectedContainerIds(selectedContainerIds.filter(x => x !== id));
    }
  };

  return (
    <div className="max-w-4xl pb-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">企业规则</h1>
          <p className="text-sm font-medium text-slate-500">企业规则配置一次，全员复用。日常装箱无需重复设置。</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          保存配置
        </button>
      </div>

      {/* Packing Rules */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-800 mb-4">
          <div className="w-1 h-3.5 bg-blue-500 rounded-full"></div>
          装箱规则
        </h3>
        
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-[13px] text-slate-700">集装箱规格与载重限制</div>
              <button onClick={addCustomContainer} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} strokeWidth={3} /> 新增自定义柜型
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mb-5">
              {containers.map(c => {
                const isSelected = selectedContainerIds.includes(c.id);
                return (
                  <div 
                    key={c.id}
                    onClick={() => toggleContainerId(c.id)}
                    className={`border-2 rounded-xl px-3.5 py-2 text-[13px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                      isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} className="text-blue-600" />}
                    {c.name}
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-3">
              {containers.filter(c => selectedContainerIds.includes(c.id)).map(c => (
                <div key={c.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 relative group transition-all hover:border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    {c.isCustom ? (
                      <input 
                        type="text"
                        value={c.name}
                        onChange={(e) => updateContainer(c.id, 'name', e.target.value)}
                        className="font-bold text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-48 shadow-sm"
                        placeholder="柜型名称"
                      />
                    ) : (
                      <div className="font-bold text-[13px] text-slate-800">{c.name}</div>
                    )}
                    {c.isCustom && (
                      <button onClick={() => removeCustomContainer(c.id)} className="text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 p-1 rounded-md shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">内长 (m)</div>
                      <input type="text" value={c.l} onChange={e => updateContainer(c.id, 'l', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="0.00" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">内宽 (m)</div>
                      <input type="text" value={c.w} onChange={e => updateContainer(c.id, 'w', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="0.00" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">内高 (m)</div>
                      <input type="text" value={c.h} onChange={e => updateContainer(c.id, 'h', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="0.00" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">容积 (m³)</div>
                      <input type="text" value={c.vol} onChange={e => updateContainer(c.id, 'vol', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="0.0" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 font-medium">标称载重 (kg)</div>
                      <input type="text" value={c.payload} onChange={e => updateContainer(c.id, 'payload', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm" placeholder="0" />
                    </div>
                    <div>
                      <div className="text-[11px] text-blue-600 mb-1 font-bold">单柜限制 (kg)</div>
                      <input type="text" value={c.limit} onChange={e => updateContainer(c.id, 'limit', e.target.value)} className="w-full bg-blue-50/50 border-2 border-blue-500 rounded-lg p-1.5 text-center text-[13px] font-black text-blue-700 focus:outline-none focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5 flex items-center justify-between">
              <div>
                <b className="text-[13px] text-slate-700">尾箱自动优化</b>
                <div className="text-xs text-slate-400 font-medium mt-0.5 max-w-[280px] leading-relaxed">尾箱将由系统根据装载效率自动择优，可能与所选规格不同。如需固定箱型，请关闭尾箱优化。</div>
              </div>
              <button 
                onClick={() => setTailToggle(!tailToggle)}
                className={`w-11 h-6 rounded-full relative transition-colors ${tailToggle ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tailToggle ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between font-bold text-[13px] text-slate-700 mb-3">
              内置规则
              <span className="text-xs text-slate-400 font-medium">系统默认执行，只读</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: "⚡ 重不压轻", d: "较重货物不压在较轻货物上方" },
                { n: "⚡ 重心居中低位", d: "整体重心居中且偏低" },
                { n: "⚡ 相同类型相邻", d: "同型号/同批次集中放置" },
                { n: "⚡ 液体独立堆叠", d: "液体托盘不与其他品类混叠" },
                { n: "⚡ 允许水平旋转", d: "水平90°旋转以充分利用空间" }
              ].map(ro => (
                <div key={ro.n} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <b className="text-[13px] text-slate-700">{ro.n}</b>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{ro.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
