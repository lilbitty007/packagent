import { Shield, User, KeyRound, MoreVertical, Plus, Send, XCircle, Smartphone, Check, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export function SystemAdminView() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userRole") === "user") {
      navigate("/");
    }
  }, [navigate]);

  const [users, setUsers] = useState([
    { name: "苏苏", role: "admin", contact: "13800000000", lastLogin: "刚刚", status: "joined", id: "u1" },
    { name: "张明", role: "user", contact: "13912345678", lastLogin: "2小时前", status: "joined", id: "u2" },
    { name: "王强", role: "user", contact: "13700001111", lastLogin: "1天前", status: "joined", id: "u3" },
    { name: "陈敏", role: "user", contact: "13600002222", lastLogin: "3天前", status: "joined", id: "u4" },
    { name: "刘洋", role: "admin", contact: "13500003333", lastLogin: "5小时前", status: "joined", id: "u5" }
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState("user");
  const [generatedLink, setGeneratedLink] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New state for dropdowns and actions
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{name: string, id: string} | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateLink = () => {
    // Generate invite link with tenant and role
    const tenantId = "qiangbang";
    const link = `${window.location.origin}/invite/test?tenantId=${tenantId}&role=${inviteRole}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    // Fallback for iframe environments where Clipboard API might be restricted
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(generatedLink).catch(() => {
          fallbackCopyTextToClipboard(generatedLink);
        });
      } else {
        fallbackCopyTextToClipboard(generatedLink);
      }
    } catch (err) {
      fallbackCopyTextToClipboard(generatedLink);
    }
    
    showToast("邀请链接已复制，请发送给新成员");
    setIsInviteModalOpen(false);
    setGeneratedLink("");
  };

  const handleResend = (contact: string) => {
    showToast(`已重新发送邀请至 ${contact}`);
  };

  const handleRevoke = (id: string, contact: string) => {
    setUsers(users.filter(u => u.id !== id));
    showToast(`已撤销对 ${contact} 的邀请`);
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    showToast(`角色已更新`);
    setActiveDropdownId(null);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      setUsers(users.filter(u => u.id !== memberToRemove.id));
      showToast(`已移除成员 ${memberToRemove.name}`);
      setMemberToRemove(null);
    }
  };

  const handleResetPassword = (id: string, name: string) => {
    setActiveDropdownId(null);
    showToast(`已将 ${name} 的密码重置为 123456`);
  };

  const joinedUsers = users.filter(u => u.status === 'joined');

  return (
    <div className="max-w-4xl pb-10 relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check size={16} strokeWidth={3} className="text-green-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">系统管理</h1>
          <p className="text-sm font-medium text-slate-500">查看企业成员与邀请状态</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          邀请成员
        </button>
      </div>

      <div className="space-y-8">
        {/* Joined Members Section */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">已加入成员 ({joinedUsers.length})</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl w-2/5">成员信息</th>
                  <th className="px-6 py-4 w-1/5">角色</th>
                  <th className="px-6 py-4 w-1/5">最后登录</th>
                  <th className="px-6 py-4 rounded-tr-2xl text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {joinedUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'admin' ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 mb-0.5">{u.name}</div>
                          <div className="text-xs font-medium text-slate-400">{u.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                          <Shield size={12} strokeWidth={3} /> 管理员
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                          <User size={12} strokeWidth={3} /> 操作员
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-500">
                        {u.lastLogin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === u.id ? null : u.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} strokeWidth={2.5} />
                        </button>
                        
                        {activeDropdownId === u.id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 animate-in fade-in zoom-in-95 origin-top-right text-left"
                          >
                            {u.id !== "u1" ? (
                              <>
                                <div 
                                  onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                                >
                                  设为{u.role === 'admin' ? '操作员' : '管理员'}
                                </div>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <div 
                                  onClick={() => handleResetPassword(u.id, u.name)}
                                  className="px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer text-left"
                                >
                                  重置密码
                                </div>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <div 
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    setMemberToRemove({name: u.name, id: u.id});
                                  }}
                                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer text-left"
                                >
                                  移除成员
                                </div>
                              </>
                            ) : (
                              <div className="px-3 py-2 text-xs font-medium text-slate-400 text-left cursor-not-allowed">
                                无法操作当前账号
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">邀请新成员</h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircle size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-5">
                {!generatedLink ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      分配角色
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${inviteRole === 'user' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          value="user" 
                          className="sr-only"
                          checked={inviteRole === 'user'}
                          onChange={() => setInviteRole('user')}
                        />
                        <div className="flex flex-col items-center gap-1.5">
                          <User size={20} strokeWidth={2.5} />
                          <span className="text-sm font-bold">操作员</span>
                        </div>
                      </label>
                      <label className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${inviteRole === 'admin' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          value="admin" 
                          className="sr-only"
                          checked={inviteRole === 'admin'}
                          onChange={() => setInviteRole('admin')}
                        />
                        <div className="flex flex-col items-center gap-1.5">
                          <Shield size={20} strokeWidth={2.5} />
                          <span className="text-sm font-bold">管理员</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      邀请链接
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 break-all select-all">
                      {generatedLink}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">新用户注册后将自动加入强邦新材料并分配对应角色。</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setGeneratedLink("");
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                {!generatedLink ? (
                  <button 
                    type="button"
                    onClick={handleGenerateLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    生成邀请链接
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    复制链接
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm border border-red-200">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">移除成员</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                您确定要将 <span className="font-bold text-slate-800">{memberToRemove.name}</span> 从企业中移除吗？该用户将无法再访问系统中的任何数据。此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMemberToRemove(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmRemoveMember}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/20 transition-all active:scale-95"
                >
                  确认移除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}