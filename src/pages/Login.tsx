import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, Zap, Wand2, Play } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithEmail, signInAsTestUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "登录失败");
    } else {
      navigate("/home");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    const result = await signInAsTestUser();
    setLoading(false);
    if (result.success) {
      navigate("/home");
    } else {
      setError(result.error || "演示账号登录失败，请检查 Supabase 配置");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/yunhu-logo.png"
            alt="云狐"
            className="h-16 mx-auto mb-5 drop-shadow-[0_0_30px_rgba(1,124,211,0.2)]"
          />
          <h1 className="text-2xl font-bold mb-2">
            <span className="gradient-text">云狐 Studio</span>
          </h1>
          <p className="text-white/35 text-sm">云狐 AI 创意工坊 · 让创作触手可及</p>
        </div>

        {/* Feature hints */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { icon: Wand2, label: "文生图" },
            { icon: Play, label: "图生视频" },
            { icon: Zap, label: "剧本生成" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border-subtle text-[11px] text-white/45">
              <f.icon className="w-3 h-3 text-brand-500" />
              {f.label}
            </div>
          ))}
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-border-default text-white/90 placeholder:text-white/20 text-sm outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-border-default text-white/90 placeholder:text-white/20 text-sm outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:from-brand-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all brand-glow"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                登录 <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-[11px] text-white/20">或</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* Demo login */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-white/[0.05] border border-border-default text-white/65 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white/85 hover:border-brand-500/30 transition-all disabled:opacity-40"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-500" />
              一键体验（Demo 账号）
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white/20 mt-8">
          使用 Demo 账号无需注册，即刻体验全部功能
        </p>
      </div>
    </div>
  );
}
