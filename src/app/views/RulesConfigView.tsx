import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export function RulesConfigView() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userRole") === "user") {
      navigate("/");
    }
  }, [navigate]);

  const [palToggle, setPalToggle] = useState(true);
  const [autoAddSize, setAutoAddSize] = useState(true);

  // Pallet Types
  const [palletTypes, setPalletTypes] = useState([
    { id: '1', name: '川字托盘', isDefault: true, enabled: true, isCustom: false },
    { id: '2', name: '田字托盘', isDefault: false, enabled: false, isCustom: false }
  ]);
  const [newPalletTypeName, setNewPalletTypeName] = useState("");

  // Base Sizes
  const [baseSizes, setBaseSizes] = useState([
    { value: 730, enabled: true, isCustom: false },
    { value: 805, enabled: true, isCustom: false },
    { value: 850, enabled: true, isCustom: false },
    { value: 1220, enabled: true, isCustom: false },
    { value: 1240, enabled: true, isCustom: false },
    { value: 1460, enabled: true, isCustom: false }
  ]);
  const [newSizeValue, setNewSizeValue] = useState("");

  const [thicknesses, setThicknesses] = useState([
    { nominal: "0.30", real: "0.261" },
    { nominal: "0.25", real: "0.24" },
    { nominal: "0.15", real: "0.14" }
  ]);

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
        if (parsed.palToggle !== undefined) setPalToggle(parsed.palToggle);
        if (parsed.autoAddSize !== undefined) setAutoAddSize(parsed.autoAddSize);
        if (parsed.palletTypes) setPalletTypes(parsed.palletTypes);
        if (parsed.baseSizes) setBaseSizes(parsed.baseSizes);
        if (parsed.thicknesses) setThicknesses(parsed.thicknesses);
        if (parsed.tailToggle !== undefined) setTailToggle(parsed.tailToggle);
        if (parsed.containers) setContainers(parsed.containers);
        if (parsed.selectedContainerIds) setSelectedContainerIds(parsed.selectedContainerIds);
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const handleSave = () => {
    const enabledTypes = palletTypes.filter(pt => pt.enabled);
    if (palToggle && enabledTypes.length === 0) {
      toast.error("至少启用一种托盘类型");
      return;
    }
    const enabledSizes = baseSizes.filter(s => s.enabled);
    if (palToggle && enabledSizes.length === 0) {
      toast.error("至少启用一个可用托盘底盘尺寸");
      return;
    }
    if (selectedContainerIds.length === 0) {
      toast.error("至少保留一种集装箱类型");
      return;
    }

    const config = {
      palToggle, autoAddSize, palletTypes, baseSizes, thicknesses, tailToggle, containers, selectedContainerIds
    };
    localStorage.setItem("rulesConfig", JSON.stringify(config));
    toast.success("已保存为「强邦新材料」默认规则");
  };

  // Pallet Type Handlers
  const togglePalletType = (id: string) => {
    const newTypes = palletTypes.map(t => {
      if (t.id === id) {
        if (t.enabled && palletTypes.filter(pt => pt.enabled).length <= 1) {
          toast.error("至少启用一种托盘类型");
          return t;
        }
        return { ...t, enabled: !t.enabled };
      }
      return t;
    });
    setPalletTypes(newTypes);
  };

  const setDefaultPalletType = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const type = palletTypes.find(t => t.id === id);
    if (!type?.enabled) {
      toast.error("只能将已启用的托盘类型设为默认");
      return;
    }
    setPalletTypes(palletTypes.map(t => ({ ...t, isDefault: t.id === id })));
  };

  const addPalletType = () => {
    if (!newPalletTypeName.trim()) {
      toast.error("托盘类型名称不能为空");
      return;
    }
    if (palletTypes.some(t => t.name === newPalletTypeName.trim())) {
      toast.error("托盘类型已存在");
      return;
    }
    const newId = Date.now().toString();
    setPalletTypes([...palletTypes, { id: newId, name: newPalletTypeName.trim(), isDefault: false, enabled: true, isCustom: true }]);
    setNewPalletTypeName("");
  };

  const removePalletType = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("确定要删除此自定义托盘类型吗？")) {
      const typeToDelete = palletTypes.find(t => t.id === id);
      if (typeToDelete?.isDefault) {
        toast.error("无法删除默认托盘类型，请先更改默认设置");
        return;
      }
      if (typeToDelete?.enabled && palletTypes.filter(t => t.enabled).length <= 1) {
        toast.error("至少保留一种已启用的托盘类型");
        return;
      }
      setPalletTypes(palletTypes.filter(t => t.id !== id));
    }
  };

  // Base Size Handlers
  const toggleBaseSize = (value: number) => {
    const newSizes = baseSizes.map(s => {
      if (s.value === value) {
        if (s.enabled && baseSizes.filter(bs => bs.enabled).length <= 1) {
          toast.error("至少启用一个托盘底盘尺寸");
          return s;
        }
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });
    setBaseSizes(newSizes);
  };

  const addBaseSize = () => {
    const val = parseInt(newSizeValue, 10);
    if (isNaN(val) || val <= 0) {
      toast.error("尺寸必须为正整数");
      return;
    }
    if (baseSizes.some(s => s.value === val)) {
      toast.error("该尺寸已存在");
      return;
    }
    setBaseSizes([...baseSizes, { value: val, enabled: true, isCustom: true }].sort((a, b) => a.value - b.value));
    setNewSizeValue("");
  };

  const removeBaseSize = (e: React.MouseEvent, value: number) => {
    e.stopPropagation();
    if (confirm("确定要删除此自定义尺寸吗？")) {
      const sizeToDelete = baseSizes.find(s => s.value === value);
      if (sizeToDelete?.enabled && baseSizes.filter(s => s.enabled).length <= 1) {
        toast.error("至少保留一个已启用的底盘尺寸");
        return;
      }
      setBaseSizes(baseSizes.filter(s => s.value !== value));
    }
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

  // Thickness Handlers
  const addThickness = () => {
    setThicknesses([...thicknesses, { nominal: "", real: "" }]);
  };

  const removeThickness = (index: number) => {
    setThicknesses(thicknesses.filter((_, i) => i !== index));
  };

  const updateThickness = (index: number, field: 'nominal'|'real', value: string) => {
    const newT = [...thicknesses];
    newT[index][field] = value;
    setThicknesses(newT);
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

      {/* Pallet Rules */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 transition-all duration-300">
        <h3 className="flex items-center justify-between text-[15px] font-bold text-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-blue-500 rounded-full"></div>
            打托规则
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            启用打托模块
            <button 
              onClick={() => setPalToggle(!palToggle)}
              className={`w-11 h-6 rounded-full relative transition-colors ${palToggle ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${palToggle ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>
        </h3>
        
        <div className={`space-y-4 transition-all duration-300 ${!palToggle ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}>
          <div className="flex items-center justify-between border border-slate-200 rounded-xl p-5">
            <div>
              <div className="font-bold text-[13px] text-slate-700">自动新增尺寸</div>
              <div className="text-[11px] text-slate-400 mt-1">遇到未知的尺寸时，自动将其保存至系统规格库</div>
            </div>
            <button 
              onClick={() => setAutoAddSize(!autoAddSize)}
              className={`w-11 h-6 rounded-full relative transition-colors ${autoAddSize ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoAddSize ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <div className="font-bold text-[13px] text-slate-700 mb-3">托盘类型</div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {palletTypes.map(t => (
                <div 
                  key={t.id}
                  onClick={() => togglePalletType(t.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer text-[14px] font-bold flex items-center justify-between group transition-colors ${
                    t.enabled ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-400 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {t.enabled ? <Check size={18} strokeWidth={3} /> : <div className="w-4 h-4 border-2 border-slate-300 rounded shrink-0" />}
                    {t.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {t.isDefault ? (
                      <Star size={16} fill="currentColor" className="text-yellow-500" />
                    ) : (
                      t.enabled && <button onClick={(e) => setDefaultPalletType(e, t.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-yellow-500 transition-opacity"><Star size={16} /></button>
                    )}
                    {t.isCustom && (
                      <button onClick={(e) => removePalletType(e, t.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center gap-2">
                <input 
                  type="text"
                  value={newPalletTypeName}
                  onChange={e => setNewPalletTypeName(e.target.value)}
                  placeholder="自定义托盘类型"
                  className="bg-transparent text-sm w-full outline-none"
                  onKeyDown={e => e.key === 'Enter' && addPalletType()}
                />
                <button onClick={addPalletType} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus size={18} /></button>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4">
              <div className="font-bold text-[13px] text-slate-700 mb-1">可用托盘底盘尺寸（mm）</div>
              <div className="text-[11px] text-slate-400 mb-3">系统将在装箱计算时，从已启用的尺寸中自由选择并组合托盘底盘长宽。</div>
              <div className="flex flex-wrap gap-2 items-center">
                {baseSizes.map(size => (
                  <div 
                    key={size.value} 
                    onClick={() => toggleBaseSize(size.value)}
                    className={`border-2 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 group ${
                      size.enabled ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-400 hover:border-blue-300 bg-white"
                    }`}
                  >
                    {size.value}
                    {size.isCustom && (
                      <button onClick={(e) => removeBaseSize(e, size.value)} className={`opacity-0 group-hover:opacity-100 ml-1 transition-opacity ${size.enabled ? 'text-blue-400 hover:text-red-500' : 'text-slate-300 hover:text-red-500'}`}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white focus-within:border-blue-500">
                  <input 
                    type="number"
                    value={newSizeValue}
                    onChange={e => setNewSizeValue(e.target.value)}
                    placeholder="新增尺寸"
                    className="w-16 text-xs outline-none bg-transparent"
                    onKeyDown={e => e.key === 'Enter' && addBaseSize()}
                  />
                  <button onClick={addBaseSize} className="text-slate-400 hover:text-blue-600"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between font-bold text-[13px] text-slate-700 mb-3">
              厚度映射
              <span className="text-xs text-slate-400 font-medium">用于真实重量计算</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {thicknesses.map((t, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3 relative group">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span>标称厚度(mm)</span>
                    <input 
                      type="text" 
                      value={t.nominal} 
                      onChange={(e) => updateThickness(idx, 'nominal', e.target.value)}
                      className="w-12 text-right bg-transparent text-slate-700 font-bold focus:outline-none border-b border-dashed border-slate-300 focus:border-blue-500" 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center relative">
                    <input 
                      type="text"
                      value={t.real}
                      onChange={(e) => updateThickness(idx, 'real', e.target.value)}
                      className="w-full text-center bg-transparent font-black text-blue-600 focus:outline-none"
                      placeholder="输入实厚"
                    />
                  </div>
                  {thicknesses.length > 1 && (
                    <button 
                      onClick={() => removeThickness(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              <div 
                onClick={addThickness}
                className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 text-slate-400 hover:text-blue-500 transition-colors h-full min-h-[88px]"
              >
                <Plus size={20} className="mb-1" />
                <span className="text-[11px] font-bold">新增厚度规格</span>
              </div>
            </div>
          </div>
        </div>
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
