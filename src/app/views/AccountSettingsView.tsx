import { UserCircle, Phone, Lock, Save, Shield, Eye, EyeOff, XCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AccountSettingsView() {
  const [formData, setFormData] = useState({
    name: "苏苏",
    phone: "13800000000",
  });

  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "user") {
      setIsUser(true);
      setFormData({
        name: "张工",
        phone: "13912345678",
      });
    }
  }, []);

  const [showPhone, setShowPhone] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("账号信息已更新");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    toast.success("密码修改成功");
    setIsPasswordModalOpen(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const maskedPhone = formData.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");

  return (
    <div className="max-w-3xl pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">账号设置</h1>
        <p className="text-sm font-medium text-slate-500">管理您的个人资料和安全选项</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200 shrink-0">
            {isUser ? "张" : "苏"}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-800">{formData.name}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${isUser ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                {isUser ? <User size={12} strokeWidth={3} /> : <Shield size={12} strokeWidth={3} />} 
                {isUser ? "操作员" : "管理员"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-3">{formData.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserCircle size={16} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                手机号码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={showPhone ? formData.phone : maskedPhone}
                  onChange={e => {
                    if (showPhone) {
                      setFormData({...formData, phone: e.target.value});
                    }
                  }}
                  readOnly={!showPhone}
                />
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Save size={16} strokeWidth={2.5} />
              保存更改
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <Lock size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">登录密码</h3>
            <p className="text-xs font-medium text-slate-500">定期更新密码可提升账号安全性</p>
          </div>
        </div>
        <button 
          onClick={() => setIsPasswordModalOpen(true)}
          className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          修改密码
        </button>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">修改登录密码</h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircle size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    当前密码
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="请输入当前密码"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    新密码
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="请输入新密码（不少于 8 位）"
                    minLength={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    确认新密码
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="请再次输入新密码"
                    minLength={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                >
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}