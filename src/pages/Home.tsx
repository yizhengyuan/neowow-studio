import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Image, Video, FileText, Clock, ArrowRight, Sparkles, Zap, Wand2 } from "lucide-react";

const studioTools = [
  {
    path: "/image-studio",
    icon: Image,
    title: "文生图",
    desc: "输入提示词，AI 生成高质量图片。支持多种风格和比例。",
    color: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
  },
  {
    path: "/video-studio",
    icon: Video,
    title: "图生视频",
    desc: "上传图片或选择生成结果，一键转为动态视频。",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    path: "/script-studio",
    icon: FileText,
    title: "剧本生成",
    desc: "输入故事梗概，AI 自动拆解为分镜脚本。",
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-5 brand-glow">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          欢迎回来，<span className="gradient-text">{user?.nickname || "Creator"}</span>
        </h1>
        <p className="text-white/35 text-sm max-w-md mx-auto">
          选择下方工具开始创作，从灵感到成品，一站式 AI 创作工坊
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {studioTools.map((tool) => (
          <button
            key={tool.path}
            onClick={() => navigate(tool.path)}
            className={`group relative p-6 rounded-2xl border border-border-subtle bg-gradient-to-br ${tool.color} hover:border-brand-500/30 hover:bg-white/[0.06] transition-all duration-300 text-left`}
          >
            <div className={`w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 ${tool.iconColor}`}>
              <tool.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white/90 mb-1.5">{tool.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{tool.desc}</p>
            <div className="flex items-center gap-1 mt-4 text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
              开始创作 <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Wand2, label: "今日生成", value: "12", unit: "次" },
          { icon: Zap, label: "剩余额度", value: "88", unit: "次" },
          { icon: Clock, label: "累计创作", value: "156", unit: "次" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-border-subtle bg-white/[0.02] text-center">
            <stat.icon className="w-4 h-4 text-white/30 mx-auto mb-2" />
            <div className="text-xl font-bold text-white/90">
              {stat.value}
              <span className="text-xs text-white/35 ml-1 font-normal">{stat.unit}</span>
            </div>
            <div className="text-[11px] text-white/30 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
