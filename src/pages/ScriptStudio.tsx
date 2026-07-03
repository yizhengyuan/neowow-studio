import { useState, useRef } from "react";
import { FileText, Wand2, ChevronRight, Play, Image as ImageIcon } from "lucide-react";
import { generateScript, mockGenerate } from "@/lib/api";

interface Scene {
  id: number;
  sceneNumber: string;
  description: string;
  visualPrompt: string;
  dialogue: string;
  duration: string;
}

export default function ScriptStudio() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("短剧");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<{
    title: string;
    logline: string;
    scenes: Scene[];
  } | null>(null);
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError("");
    setGenerating(true);
    try {
      const result = await generateScript(prompt, { style, language: "zh" });
      setScript(result);
      setActiveScene(null);
    } catch (e: any) {
      console.error("Script generation error:", e);
      // Mock fallback
      try {
        const mock = mockGenerate(prompt, "script");
        setScript(mock as any);
        setActiveScene(null);
      } catch {
        setError(e?.message || "生成失败，请稍后重试");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        {/* Left panel */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white/85 mb-1">剧本生成</h2>
            <p className="text-xs text-white/35">输入故事梗概，AI 生成分镜脚本</p>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">故事梗概</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你的故事，例如：一个年轻女孩在森林中发现了一扇通往魔法世界的大门，她在那里遇到了会说话的动物，并一起对抗黑暗势力..."
              rows={7}
              className="w-full p-3 rounded-xl bg-white/[0.03] border border-border-default text-white/80 placeholder:text-white/18 text-xs resize-none outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all"
            />
          </div>

          {/* Style */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">剧本类型</label>
            <div className="grid grid-cols-2 gap-1.5">
              {["短剧", "漫剧", "动画", "电影"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`h-9 rounded-lg border text-xs font-medium transition-all ${
                    style === s
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-border-subtle text-white/40 hover:text-white/60 hover:border-border-default"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:from-brand-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all brand-glow"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI 正在编写剧本...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                生成分镜脚本
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Right panel - Script Result */}
        <div>
          {!script && !generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border-subtle rounded-2xl">
              <FileText className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/20">输入故事梗概，生成分镜脚本</p>
              <p className="text-xs text-white/10 mt-1">AI 将自动拆解为 5-8 个场景</p>
            </div>
          )}

          {generating && !script && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-border-subtle rounded-2xl">
              <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-white/40">AI 正在编写分镜脚本...</p>
              <p className="text-xs text-white/20 mt-1">分析故事 → 拆解场景 → 生成分镜</p>
            </div>
          )}

          {script && (
            <div className="space-y-4">
              {/* Title & Logline */}
              <div className="p-5 rounded-2xl border border-border-subtle bg-gradient-to-br from-brand-500/5 to-transparent">
                <h3 className="text-lg font-bold gradient-text mb-1">{script.title}</h3>
                <p className="text-xs text-white/45">{script.logline}</p>
              </div>

              {/* Scenes timeline */}
              <div className="space-y-3">
                {script.scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                      activeScene === idx
                        ? "border-brand-500/40 bg-brand-500/5"
                        : "border-border-subtle bg-white/[0.01] hover:border-border-default"
                    }`}
                    onClick={() => setActiveScene(activeScene === idx ? null : idx)}
                  >
                    {/* Scene header */}
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand-400">{scene.sceneNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{scene.description}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">时长: {scene.duration}秒</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${
                          activeScene === idx ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {/* Expanded detail */}
                    {activeScene === idx && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-4 mx-4">
                        {/* Dialogue */}
                        {scene.dialogue && (
                          <div>
                            <label className="text-[10px] text-white/35 font-medium mb-1 block">台词 / 旁白</label>
                            <p className="text-sm text-white/70 bg-white/[0.03] rounded-lg p-3 italic">
                              「{scene.dialogue}」
                            </p>
                          </div>
                        )}

                        {/* Visual prompt */}
                        <div>
                          <label className="text-[10px] text-white/35 font-medium mb-1.5 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            视觉提示词（可用于文生图）
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-[11px] text-brand-300 bg-brand-500/5 rounded-lg p-2.5 font-mono leading-relaxed">
                              {scene.visualPrompt}
                            </code>
                            <button
                              className="shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all flex items-center justify-center"
                              title="用此提示词生成图片"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to image studio with prefill
                                window.localStorage.setItem("prefill_prompt", scene.visualPrompt);
                                window.location.href = "/image-studio";
                              }}
                            >
                              <Wand2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-white/[0.01]">
                <Play className="w-4 h-4 text-brand-500" />
                <span className="text-xs text-white/45">
                  共 <span className="text-white/70 font-medium">{script.scenes.length}</span> 个场景 ·
                  预计总时长 <span className="text-white/70 font-medium">
                    {script.scenes.reduce((s, c) => s + parseInt(c.duration) || 5, 0)}
                  </span> 秒
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
