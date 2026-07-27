import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Package, CheckCircle2, AlertCircle } from "lucide-react";

export function AcceptInviteView() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Mock checking the token status
  const isInvalid = token === "expired" || token === "invalid";
  const [form, setForm] = useState({ contact: "", name: "", password: "" });

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate accepting invite
    localStorage.setItem("userRole", role);
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
  };

  const role = token === "admin" ? "admin" : "user";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="p-8 pb-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 mb-5">
            <Package size={28} strokeWidth={2.5} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">PackAgent</h1>
          {isInvalid ? (
            <p className="text-red-500 font-bold flex items-center gap-1.5">
              <AlertCircle size={16} strokeWidth={2.5} />
              邀请链接已失效
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-slate-600 font-medium">
                <span className="font-bold text-slate-800">强邦新材料</span> 邀请您加入企业
              </p>
              <div className="flex flex-col items-center mt-2 gap-2">
                <p className={`text-xs font-bold inline-block px-2.5 py-1 rounded-md ${role === 'admin' ? 'text-indigo-600 bg-indigo-50' : 'text-blue-600 bg-blue-50'}`}>
                  分配角色：{role === 'admin' ? '管理员' : '操作员'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-6">
          {isInvalid ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                该邀请链接可能已过期、已被撤销或您已经接受过邀请。<br/>
                请联系管理员重新发送，或直接前往登录。
              </p>
              <button 
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                ���登录
              </button>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">登录账号 (手机号)</label>
                <input 
                  type="text" 
                  required
                  placeholder="请输入手机号"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={form.contact}
                  onChange={e => setForm({...form, contact: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">真实姓名</label>
                <input 
                  type="text" 
                  required
                  placeholder="请输入您的姓名"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">设置登录密码</label>
                <input 
                  type="password" 
                  required
                  placeholder="至少 6 位字符"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-95"
              >
                <CheckCircle2 size={18} strokeWidth={2.5} />
                接受邀请并加入
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}