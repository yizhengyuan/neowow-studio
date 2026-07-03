// AI API helpers - call Supabase Edge Functions or direct Replicate/OpenAI APIs

const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || "";

interface GenerationResult {
  id: string;
  output: string | string[];
  status: "succeeded" | "failed" | "processing";
  error?: string;
}

// Text-to-Image using Replicate (Flux)
export async function textToImage(
  prompt: string,
  options: {
    model?: string;
    aspectRatio?: string;
    numOutputs?: number;
    outputFormat?: string;
  } = {}
): Promise<GenerationResult> {
  const {
    model = "black-forest-labs/flux-schnell",
    aspectRatio = "1:1",
    numOutputs = 1,
    outputFormat = "jpg",
  } = options;

  // Try Supabase Edge Function first, fallback to direct Replicate
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  if (baseUrl) {
    const res = await fetch(`${baseUrl}/text-to-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, aspect_ratio: aspectRatio, num_outputs: numOutputs, output_format: outputFormat }),
    });
    return res.json();
  }

  // Direct Replicate API call (requires token on frontend — not recommended for production)
  if (REPLICATE_TOKEN) {
    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
      },
      body: JSON.stringify({
        version: model,
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          num_outputs: numOutputs,
          output_format: outputFormat,
        },
      }),
    });
    const prediction = await res.json();

    // Poll for result
    if (prediction.urls?.get) {
      let result = prediction;
      while (result.status !== "succeeded" && result.status !== "failed") {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(prediction.urls.get, {
          headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
        });
        result = await pollRes.json();
      }
      return {
        id: result.id,
        output: result.output,
        status: result.status,
        error: result.error,
      };
    }
    return prediction;
  }

  throw new Error("No API base URL or Replicate token configured");
}

// Image-to-Video using Replicate (Stable Video Diffusion)
export async function imageToVideo(
  imageUrl: string,
  options: {
    fps?: number;
    motionBucketId?: number;
  } = {}
): Promise<GenerationResult> {
  const { fps = 6, motionBucketId = 127 } = options;

  if (REPLICATE_TOKEN) {
    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
      },
      body: JSON.stringify({
        version: "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        input: {
          input_image: imageUrl,
          fps,
          motion_bucket_id: motionBucketId,
        },
      }),
    });
    const prediction = await res.json();

    if (prediction.urls?.get) {
      let result = prediction;
      while (result.status !== "succeeded" && result.status !== "failed") {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(prediction.urls.get, {
          headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
        });
        result = await pollRes.json();
      }
      return {
        id: result.id,
        output: result.output,
        status: result.status,
        error: result.error,
      };
    }
    return prediction;
  }

  throw new Error("No Replicate token configured");
}

// Script Generation using LLM API
export async function generateScript(
  prompt: string,
  options: {
    style?: string;
    language?: string;
  } = {}
): Promise<{
  title: string;
  logline: string;
  scenes: Array<{
    id: number;
    sceneNumber: string;
    description: string;
    visualPrompt: string;
    dialogue: string;
    duration: string;
  }>;
}> {
  const { style = "短剧", language = "zh" } = options;

  const llmApiKey = import.meta.env.VITE_LLM_API_KEY || "";
  const llmApiBase = import.meta.env.VITE_LLM_API_BASE || "https://api.openai.com/v1";

  const systemPrompt = `你是一位专业的${style}编剧。根据用户提供的故事梗概，生成一个完整的分镜脚本。
返回 JSON 格式：
{
  "title": "标题",
  "logline": "一句话梗概",
  "scenes": [
    {
      "id": 1,
      "sceneNumber": "S1",
      "description": "场景描述",
      "visualPrompt": "用于AI生图的视觉提示词",
      "dialogue": "台词或旁白",
      "duration": "时长秒数"
    }
  ]
}
生成 5-8 个场景。`;

  const res = await fetch(`${llmApiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmApiKey}`,
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_LLM_MODEL || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from LLM");

  return JSON.parse(content);
}

// Mock function for demo (when no API keys configured)
export function mockGenerate(prompt: string, type: "image" | "video" | "script") {
  if (type === "image") {
    return {
      id: `mock-${Date.now()}`,
      output: [`https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 20))}/512/512`],
      status: "succeeded" as const,
    };
  }
  if (type === "video") {
    return {
      id: `mock-${Date.now()}`,
      output: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b709da7d-5b69-4a1f-a96a-f54082aff3d4/id-preview-b7892a42--c62b7d1f-a49b-435f-8a03-320fba11e7b4.lovable.app-1773921593272.png"],
      status: "succeeded" as const,
    };
  }
  // script
  return {
    title: `${prompt.substring(0, 30)}`,
    logline: "这是一个关于勇气与梦想的精彩故事...",
    scenes: [
      { id: 1, sceneNumber: "S1", description: "主角在晨光中醒来，新的冒险即将开始", visualPrompt: "A person waking up in golden morning light, cinematic, 4K", dialogue: "又是新的一天...", duration: "5" },
      { id: 2, sceneNumber: "S2", description: "踏上征途，穿越未知的森林", visualPrompt: "Epic forest landscape, fantasy style, cinematic lighting", dialogue: "前方会有什么等着我？", duration: "8" },
      { id: 3, sceneNumber: "S3", description: "遇到挑战，面对内心的恐惧", visualPrompt: "A hero facing a giant shadow, dramatic contrast, movie poster style", dialogue: "我不能退缩！", duration: "6" },
      { id: 4, sceneNumber: "S4", description: "战胜困难，收获成长", visualPrompt: "Triumphant moment, golden sunset, hero silhouette, cinematic", dialogue: "我终于明白了...", duration: "7" },
      { id: 5, sceneNumber: "S5", description: "回到起点，已是崭新的自己", visualPrompt: "Returning home transformed, warm colors, peaceful ending shot", dialogue: "这是结束，也是开始。", duration: "5" },
    ],
  };
}
