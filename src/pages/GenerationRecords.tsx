import { useState } from "react";
import { Clock, Image, Video, FileText, Trash2, Eye } from "lucide-react";

interface Record {
  id: string;
  type: "image" | "video" | "script";
  prompt: string;
  result: string | string[];
  createdAt: Date;
}

// Mock records for demo
const mockRecords: Record[] = [
  {
    id: "1",
    type: "image",
    prompt: "一只在月光下飞翔的白色猫头鹰，奇幻风格",
    result: ["https://picsum.photos/seed/owl/512/512"],
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "image",
    prompt: "赛博朋克城市的夜景，霓虹灯闪烁",
    result: ["https://picsum.photos/seed/cyber/512/512"],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    type: "video",
    prompt: "将山水画转为动态视频",
    result: "https://picsum.photos/seed/video/512/512",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    type: "script",
    prompt: "一个关于时间旅行的短剧",
    result: "分镜脚本已生成",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];

const typeConfig = {
  image: { icon: Image, label: "文生图", color: "text-violet-400", bg: "bg-violet-500/10" },
  video: { icon: Video, label: "图生视频", color: "text-blue-400", bg: "bg-blue-500/10" },
  script: { icon: FileText, label: "剧本生成", color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function GenerationRecords() {
  const [records, setRecords] = useState(mockRecords);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "script">("all");

  const filtered = filter === "all" ? records : records.filter((r) => r.type === filter);

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white/85 mb-1">生成记录</h2>
          <p className="text-xs text-white/35">查看所有 AI 生成历史</p>
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "image", "video", "script"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "all" ? "全部" : typeConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Records list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-2xl">
          <Clock className="w-10 h-10 text-white/10 mb-3" />
          <p className="text-sm text-white/25">暂无生成记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => {
            const cfg = typeConfig[record.type];
            const Icon = cfg.icon;
            return (
              <div
                key={record.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[10px] text-white/25">{formatTime(record.createdAt)}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate">{record.prompt}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/35 hover:text-white/70 transition-all"
                    title="查看"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/35 hover:text-red-400 transition-all"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
