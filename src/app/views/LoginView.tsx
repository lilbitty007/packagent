import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import newLogoImage from "../../imports/ChatGPT_Image_2026_6_23__14_34_26.png";
import bgImage from "../../imports/ChatGPT_Image_2026_6_23__14_26_12.png";

export function LoginView() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password) {
      setError("请输入账号和密码");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Mock login validation
      if (account.length > 0 && password.length >= 6) {
        if (account.includes("user")) {
          localStorage.setItem("userRole", "user");
        } else {
          localStorage.setItem("userRole", "admin");
        }
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      } else {
        setError("密码错误，请重试 (输入任意账号和至少6位密码)");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans text-white bg-slate-950 flex items-center justify-center p-6 z-0">
      
      {/* Background Image */}
      <ImageWithFallback 
        src={bgImage} 
        alt="Login Background" 
        className="absolute inset-0 w-full h-full object-cover object-center z-0" 
      />

      {/* Container - White Card Background */}
      <div className="w-full max-w-[380px] min-h-[540px] flex flex-col justify-center relative z-10 px-8 py-12 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.2)] border border-white/50">
        
        <div className="flex items-center w-full mb-10">
          <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] flex-shrink-0 mr-5">
            <ImageWithFallback 
              src={newLogoImage} 
              alt="Logo" 
              className="w-full h-full object-contain object-left"
            />
          </div>
          <div className="flex flex-col justify-center space-y-3 pt-1">
            <h3 className="text-xl sm:text-[22px] font-bold text-slate-800 tracking-tight leading-none text-left">
              欢迎登录
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 tracking-wide text-left font-medium">
              装箱智能体
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center justify-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div className="relative group">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                required
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入账号" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="relative group">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base tracking-wider py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "登 录"
            )}
          </button>
          
          <div className="pt-4 flex justify-center text-xs text-slate-400">
            <button 
              type="button" 
              onClick={() => navigate('/invite/test')}
              className="hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              模拟点击邀请链接测试
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
