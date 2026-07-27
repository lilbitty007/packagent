import { Outlet, NavLink, useNavigate } from "react-router";
import { Package, Rocket, FolderClock, Settings, Users, LogOut, ChevronDown, Shield, UserCircle } from "lucide-react";
import { useEffect } from "react";

export function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Basic auth check
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const isUser = localStorage.getItem("userRole") === "user";
  const userName = isUser ? "张工" : "苏苏";
  const userAvatar = isUser ? "张" : "苏";
  const userRoleText = isUser ? "操作员" : "管理员";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Full Height */}
      <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
        
        {/* Brand & Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/20 shrink-0">
            <Package size={18} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-base font-black text-slate-800 tracking-tight">PackAgent</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 mt-6 custom-scrollbar">
          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2.5 px-2">工作区</div>
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                    isActive ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50 border border-blue-100/50" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Rocket size={18} strokeWidth={2.5} className={isActive ? "text-blue-500" : ""} />
                    <span>开始装箱</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                    isActive ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50 border border-blue-100/50" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <FolderClock size={18} strokeWidth={2.5} className={isActive ? "text-blue-500" : ""} />
                    <span>历史方案</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>

          {!isUser && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2.5 px-2">设置</div>
              <nav className="space-y-1">
                <NavLink
                  to="/config"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                      isActive ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50 border border-blue-100/50" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Settings size={18} strokeWidth={2.5} className={isActive ? "text-blue-500" : ""} />
                      <span>企业规则</span>
                    </>
                  )}
                </NavLink>
                
                <NavLink
                  to="/system"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                      isActive ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50 border border-blue-100/50" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Users size={18} strokeWidth={2.5} className={isActive ? "text-blue-500" : ""} />
                      <span>系统管理</span>
                    </>
                  )}
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-indigo-100/30">
          <div className="mb-4 px-2">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">当前企业</div>
            <div className="text-sm font-black text-indigo-900 tracking-tight">强邦新材料</div>
          </div>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-indigo-200 shrink-0">
              {userAvatar}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-slate-800 truncate">{userName}</span>
                <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isUser ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
                  {!isUser && <Shield size={10} strokeWidth={3} />} {userRoleText}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/account")} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl font-bold transition-colors text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 shadow-sm">
              <UserCircle size={15} strokeWidth={2.5} />
              <span className="text-xs">账号设置</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl font-bold transition-colors text-slate-500 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
            >
              <LogOut size={15} strokeWidth={2.5} />
              <span className="text-xs">退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50/80 relative">
        <div className="max-w-[1200px] mx-auto p-8 lg:p-10 min-h-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}