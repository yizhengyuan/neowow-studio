import { useState, useRef } from "react";
import { Wand2, Download, X, Image as ImageIcon, Zap } from "lucide-react";
import { textToImage, mockGenerate } from "@/lib/api";

type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
type ImageStyle = "cinematic" | "anime" | "photographic" | "digital-art" | "oil-painting";

const RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "1:1", icon: "□" },
  { value: "4:3", label: "4:3", icon: "▯" },
  { value: "3:4", label: "3:4", icon: "▮" },
  { value: "16:9", label: "16:9", icon: "▭" },
  { value: "9:16", label: "9:16", icon: "▯" },
];

const STYLES: { value: ImageStyle; label: string }[] = [
  { value: "cinematic", label: "电影感" },
  { value: "anime", label: "动漫" },
  { value: "photographic", label: "写实摄影" },
  { value: "digital-art", label: "数字艺术" },
  { value: "oil-painting", label: "油画" },
];

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [style, setStyle] = useState<ImageStyle>("cinematic");
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError("");
    setGenerating(true);
    try {
      const stylePrompt = {
        cinematic: ", cinematic lighting, 8K, movie poster style",
        anime: ", anime style, studio ghibli, vibrant",
        photographic: ", photorealistic, 8K, professional photography",
        "digital-art": ", digital art, concept art, trending on artstation",
        "oil-painting": ", oil painting, masterpiece, detailed brushwork",
      };
      const fullPrompt = prompt + stylePrompt[style];
      const result = await textToImage(fullPrompt, { aspectRatio: ratio, numOutputs: count });
      if (result.status === "succeeded") {
        const outputs = Array.isArray(result.output) ? result.output : [result.output];
        setResults(outputs);
      } else {
        throw new Error(result.error || "生成失败");
      }
    } catch (e: any) {
      console.error("Generation error:", e);
      // Fallback to mock
      try {
        const mock = mockGenerate(prompt, "image");
        setResults(mock.output as string[]);
      } catch {
        setError(e?.message || "生成失败，请稍后重试");
      }
    } finally {
      setGenerating(false);
    }
  };

  const ratioWidth: Record<AspectRatio, string> = {
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
    "3:4": "aspect-[3/4]",
    "16:9": "aspect-[16/9]",
    "9:16": "aspect-[9/16]",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* Left panel - Controls */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white/85 mb-1">文生图</h2>
            <p className="text-xs text-white/35">输入描述，AI 为你生成图片</p>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">提示词</label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要的画面，例如：一只在月光下飞翔的白色猫头鹰，奇幻风格..."
              rows={5}
              className="w-full p-3 rounded-xl bg-white/[0.03] border border-border-default text-white/80 placeholder:text-white/18 text-xs resize-none outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all"
            />
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">画面比例</label>
            <div className="flex gap-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRatio(r.value)}
                  className={`flex-1 h-9 rounded-lg border text-xs font-medium transition-all ${
                    ratio === r.value
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-border-subtle text-white/40 hover:text-white/60 hover:border-border-default"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">图片风格</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`h-9 rounded-lg border text-xs font-medium transition-all ${
                    style === s.value
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-border-subtle text-white/40 hover:text-white/60 hover:border-border-default"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-[11px] text-white/45 font-medium mb-2 block">生成数量</label>
            <div className="flex gap-1.5">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`w-10 h-9 rounded-lg border text-xs font-medium transition-all ${
                    count === n
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-border-subtle text-white/40 hover:text-white/60 hover:border-border-default"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:from-brand-400 hover:to-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all brand-glow"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                开始生成
              </>
            )}
          </button>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Right panel - Results */}
        <div>
          {results.length === 0 && !generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border-subtle rounded-2xl">
              <ImageIcon className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/20">输入提示词，开始生成图片</p>
              <p className="text-xs text-white/10 mt-1">生成的图片将显示在这里</p>
            </div>
          )}

          {generating && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-border-subtle rounded-2xl">
              <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-white/40">AI 正在创作中...</p>
              <p className="text-xs text-white/20 mt-1">通常需要 5-15 秒</p>
            </div>
          )}

          {results.length > 0 && (
            <div className={`grid gap-3 ${
              results.length === 1 ? "grid-cols-1" : results.length === 2 ? "grid-cols-2" : "grid-cols-2"
            }`}>
              {results.map((url, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border border-border-subtle bg-surface-3 cursor-pointer hover:border-brand-500/30 transition-all ${ratioWidth[ratio]}`}
                  onClick={() => setPreviewIdx(idx)}
                >
                  <img src={url} alt={`生成结果 ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Download
                      className="w-5 h-5 text-white/80 hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, "_blank");
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewIdx !== null && results[previewIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setPreviewIdx(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            onClick={() => setPreviewIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={results[previewIdx]}
            alt="预览"
            className="max-w-full max-h-[80vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
