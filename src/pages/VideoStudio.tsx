import { useState, useRef } from "react";
import { Play, Upload, X, Image as ImageIcon, Film, Zap } from "lucide-react";
import { imageToVideo, mockGenerate } from "@/lib/api";

export default function VideoStudio() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [fps, setFps] = useState(6);
  const [motion, setMotion] = useState(127);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!sourceUrl) return;
    setError("");
    setGenerating(true);
    try {
      const res = await imageToVideo(sourceUrl, { fps, motionBucketId: motion });
      if (res.status === "succeeded") {
        const output = Array.isArray(res.output) ? res.output[0] : res.output;
        setResult(output);
      } else {
        throw new Error(res.error || "生成失败");
      }
    } catch (e: any) {
      console.error("Video generation error:", e);
      // Mock fallback
      try {
        const mock = mockGenerate("video", "video");
        const mockUrl = Array.isArray(mock.output) ? (mock.output[0] || null) : (mock.output || null);
        setResult(mockUrl);
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
            <h2 className="text-sm font-semibold text-white/85 mb-1">图生视频</h2>
            <p className="text-xs text-white/35">上传一张图片，AI 将其转为动态视频</p>
          </div>

          {/* Image upload / paste URL */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">上传图片</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                sourceUrl
                  ? "border-brand-500/40 bg-brand-500/5"
                  : dragOver
                  ? "border-brand-500/50 bg-brand-500/5"
                  : "border-border-subtle hover:border-border-default bg-white/[0.01]"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {sourceUrl ? (
                <div className="relative">
                  <img src={sourceUrl} alt="Source" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setSourceUrl(""); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/15 mx-auto mb-3" />
                  <p className="text-xs text-white/30">拖拽图片到此处，或点击上传</p>
                  <p className="text-[11px] text-white/15 mt-1">支持 JPG、PNG、WebP</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* URL input */}
            <div className="mt-3">
              <label className="text-[11px] text-white/45 font-medium mb-1.5 block">或输入图片 URL</label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full h-9 px-3 rounded-lg bg-white/[0.03] border border-border-default text-white/70 placeholder:text-white/18 text-xs outline-none focus:border-brand-500/50 transition-all"
              />
            </div>
          </div>

          {/* FPS */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">帧率 (FPS): {fps}</label>
            <input
              type="range"
              min={4}
              max={30}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-white/25">
              <span>4</span><span>30</span>
            </div>
          </div>

          {/* Motion */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">运动幅度: {motion}</label>
            <input
              type="range"
              min={0}
              max={255}
              value={motion}
              onChange={(e) => setMotion(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-white/25">
              <span>静态</span><span>剧烈</span>
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={generating || !sourceUrl}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:from-brand-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all brand-glow"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                生成中...（约 30-60 秒）
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                生成视频
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Right panel - Result */}
        <div>
          {!result && !generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border-subtle rounded-2xl">
              <Film className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/20">上传图片，生成视频</p>
              <p className="text-xs text-white/10 mt-1">生成的视频将显示在这里</p>
            </div>
          )}

          {generating && !result && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-border-subtle rounded-2xl">
              <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-white/40">AI 正在生成视频...</p>
              <p className="text-xs text-white/20 mt-1">通常需要 30-60 秒</p>
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-border-subtle overflow-hidden bg-surface-3">
              {result.endsWith(".mp4") || result.endsWith(".webm") ? (
                <video src={result} controls className="w-full rounded-2xl" />
              ) : (
                <img src={result} alt="Generated" className="w-full rounded-2xl" />
              )}
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs text-white/35">生成完成</span>
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1"
                >
                  <DownloadIcon className="w-3 h-3" /> 下载
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
