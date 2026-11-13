import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Server AI service is not configured in the runtime environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseJsonResponse<T = any>(rawText: string | undefined): T {
  const text = (rawText || "").trim();
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

function getErrorMessage(err: any): string {
  if (!err) return "Unknown server error";
  if (typeof err.message === "string" && err.message.trim()) return err.message;
  return String(err);
}

// 1. Web Search Grounding API
app.post("/api/sources/search", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Perform an authoritative, in-depth web search for: "${query.trim()}".
Summarize the most critical, verified facts, statistical data, implications, and key developments.
Include 4-6 bullet point key highlights starting with "- " and cite concrete findings.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text || "";
    const chunks = (response.candidates?.[0]?.groundingMetadata as any)?.groundingChunks || [];
    const lines = summary
      .split("\n")
      .filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    const extractedHighlights = lines
      .slice(0, 6)
      .map((l) => l.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean);

    return res.json({
      summary,
      groundingChunks: chunks,
      extractedHighlights:
        extractedHighlights.length > 0
          ? extractedHighlights
          : summary
              .split(/(?<=[.!?])\s+/)
              .slice(0, 4)
              .filter(Boolean),
    });
  } catch (err: any) {
    console.error("[/api/sources/search] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 2. Specific URL Context / Scraper API
app.post("/api/sources/url", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "URL is required." });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Extract, analyze, and synthesize the primary content from this URL: ${url.trim()}.
Provide:
1. A concise, factual executive summary.
2. 5 bullet points starting with "- " of key highlights and specific data from the page.
3. Main topic categories.`,
      config: {
        tools: [{ urlContext: {} }],
      },
    });

    const text = response.text || "";
    const lines = text
      .split("\n")
      .filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    const keyHighlights = lines
      .slice(0, 5)
      .map((l) => l.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean);

    let hostname = url.trim();
    try {
      hostname = new URL(url.trim()).hostname;
    } catch {
      hostname = url.trim().replace(/^https?:\/\//, "").split("/")[0];
    }

    return res.json({
      title: `Source: ${hostname}`,
      summary: text,
      keyHighlights:
        keyHighlights.length > 0
          ? keyHighlights
          : text
              .split(/(?<=[.!?])\s+/)
              .slice(0, 4)
              .filter(Boolean),
      rawExcerpt: text.slice(0, 1500),
    });
  } catch (err: any) {
    console.error("[/api/sources/url] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 2b. Real File / Audio / Video Ingestion & Transcription API
app.post("/api/sources/ingest-file", async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType, base64Data, textContent, sourceType, title } = req.body;
    if (!fileName && !textContent && !base64Data) {
      return res.status(400).json({ error: "File data or text content is required." });
    }

    const ai = getAIClient();
    let extractedText = typeof textContent === "string" ? textContent.trim() : "";

    // If audio or video binary was uploaded, transcribe it first with gemini-3.5-transcribe
    if (!extractedText && base64Data && mimeType) {
      if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) {
        const transcribeResp = await ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: "Transcribe this media accurately with speaker labels if multiple speakers are present." },
            ],
          },
        });
        extractedText = (transcribeResp.text || "").trim();
      } else {
        // PDF or binary document passed as inlineData to gemini-4-hydrogen
        const docResp = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: "Extract the full textual content and key quantitative data from this document accurately." },
            ],
          },
        });
        extractedText = (docResp.text || "").trim();
      }
    }

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract readable text from the uploaded file." });
    }

    // Summarize and extract real highlights/tags
    const analysisResp = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Analyze the following ingested source material (${fileName || title || sourceType || "document"}).
Extract an accurate summary, 4-5 specific key highlights grounded strictly in the text, and 3 concise topic tags.

CONTENT:
${extractedText.slice(0, 20000)}

Return JSON only:
{
  "title": "Descriptive title for this source",
  "summary": "2-3 sentence factual summary",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
  "tags": ["Tag1", "Tag2", "Tag3"]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonResponse<{
      title?: string;
      summary: string;
      highlights: string[];
      tags: string[];
    }>(analysisResp.text);

    return res.json({
      title: title || parsed.title || fileName || "Uploaded Source",
      summary: parsed.summary || extractedText.slice(0, 240),
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : ["Uploaded"],
      rawContent: extractedText,
    });
  } catch (err: any) {
    console.error("[/api/sources/ingest-file] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 3. Pitch & Angle Generation API
app.post("/api/pitch/generate", async (req: Request, res: Response) => {
  try {
    const { sources, topic, targetAudience, tone, model } = req.body;
    const ai = getAIClient();

    const sourcesContext =
      Array.isArray(sources) && sources.length > 0
        ? sources
            .map(
              (s: any, idx: number) =>
                `Source [${idx + 1}] (${s.type}): ${s.title}\n${s.rawContent || s.content || s.summary || ""}\nHighlights:\n${(s.highlights || []).join("\n")}`
            )
            .join("\n\n---\n\n")
        : `General Topic: ${topic || "Multi-Source Content Strategy"}`;

    const prompt = `You are an editorial strategist.
Analyze ONLY the following provided briefing materials:

${sourcesContext.slice(0, 24000)}

Topic Focus: "${topic || "Synthesize key insights from provided sources"}"
Target Audience: "${targetAudience || "Decision-makers and practitioners"}"
Tone: "${tone || "Authoritative, analytical, crisp"}"

Tasks:
1. Extract 4 concrete highlights grounded in the sources.
2. Group findings into 4 distinct categories.
3. Propose 3 distinct editorial pitches/angles for a comprehensive blog post.
4. Formulate 3-4 strict topic guardrails so the draft stays focused on these sources.

Return clean JSON with this exact structure:
{
  "curatedHighlights": ["...", "...", "...", "..."],
  "categories": [
    { "name": "...", "points": ["...", "..."] }
  ],
  "pitches": [
    {
      "id": "angle-1",
      "title": "...",
      "hook": "...",
      "targetAudience": "...",
      "keyArguments": ["...", "..."],
      "recommendedFormat": "Strategic Guide"
    },
    {
      "id": "angle-2",
      "title": "...",
      "hook": "...",
      "targetAudience": "...",
      "keyArguments": ["...", "..."],
      "recommendedFormat": "Technical Deep Dive"
    },
    {
      "id": "angle-3",
      "title": "...",
      "hook": "...",
      "targetAudience": "...",
      "keyArguments": ["...", "..."],
      "recommendedFormat": "Executive Brief"
    }
  ],
  "topicGuardrails": ["...", "...", "..."]
}`;

    const selectedModel =
      model === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-4-hydrogen";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonResponse(response.text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("[/api/pitch/generate] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 4. Complete Long-Form Blog Generator API
app.post("/api/blog/generate", async (req: Request, res: Response) => {
  try {
    const { sources, pitch, selectedHighlights, tone, blogType, customInstructions, model } = req.body;
    const ai = getAIClient();

    const sourcesSummary = Array.isArray(sources)
      ? sources
          .map(
            (s: any, idx: number) =>
              `[Source ${idx + 1}] ${s.title} (${s.type})\n${s.rawContent || s.summary || s.content || ""}`
          )
          .join("\n\n---\n\n")
      : "No sources provided";

    const prompt = `You are an expert journalist and content strategist.
Draft a complete, publication-ready blog post based strictly on these inputs:

PITCH & ANGLE:
Title: ${pitch?.title || "Synthesized Analysis"}
Hook: ${pitch?.hook || ""}
Format: ${blogType || pitch?.recommendedFormat || "Strategic In-Depth Guide"}

CURATED HIGHLIGHTS:
${(selectedHighlights || []).map((h: string) => `- ${h}`).join("\n")}

SOURCES DETAIL:
${sourcesSummary.slice(0, 24000)}

REQUIREMENTS:
- Tone: ${tone || "Authoritative, analytical, clear, and objective"}
- Format: Rich Markdown with H1 (# Title), H2, H3, bullet points, callout blockquotes, comparison table where appropriate, and a Key Takeaways section.
- Substantive depth (800+ words). Ground claims in the provided sources using citations like [Source 1].
- ${customInstructions || "Stay strictly on topic."}

Return JSON only:
{
  "title": "Article headline",
  "metaDescription": "Under 155 chars SEO summary",
  "slug": "url-friendly-slug",
  "keywords": ["kw1", "kw2", "kw3", "kw4"],
  "content": "Full markdown starting with # Title..."
}`;

    const selectedModel =
      model === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-4-hydrogen";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonResponse<{
      title?: string;
      metaDescription?: string;
      slug?: string;
      keywords?: string[];
      content: string;
    }>(response.text);

    const fullText = parsed.content || "";
    const titleMatch = fullText.match(/^#\s+(.+)$/m);
    const title = parsed.title || (titleMatch ? titleMatch[1] : pitch?.title || "Generated Article");
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return res.json({
      title,
      metaDescription: parsed.metaDescription || fullText.replace(/[#>*`\n]+/g, " ").slice(0, 150),
      readingTime: `${Math.max(1, Math.round(wordCount / 220))} min read`,
      slug:
        parsed.slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ["Analysis", "Strategy"],
      content: fullText,
    });
  } catch (err: any) {
    console.error("[/api/blog/generate] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 5. Podcast Script Generation API
app.post("/api/podcast/generate", async (req: Request, res: Response) => {
  try {
    const { blogPost, episodeTitle, hostName, guestName, targetDuration, model } = req.body;
    const ai = getAIClient();

    const blogContent = typeof blogPost === "string" ? blogPost : blogPost?.content || "";
    if (!blogContent.trim()) {
      return res.status(400).json({ error: "Blog content is required to generate a podcast." });
    }

    const host = hostName || "Sarah Jenkins";
    const guest = guestName || "Dr. Marcus Vance";

    const prompt = `You are an executive podcast producer.
Convert this blog post into an engaging, natural 2-person podcast dialogue:

BLOG CONTENT:
${blogContent.slice(0, 12000)}

SPEAKERS:
- Host: "${host}" (curious, incisive, asks sharp questions)
- Guest: "${guest}" (deep subject authority, practical, conversational)

REQUIREMENTS:
- Target duration: ~${targetDuration || 5} minutes (10-14 conversational turns).
- Natural spoken cadence suitable for voice synthesis.
- Chapter timestamps and concise show notes.

Return JSON only:
{
  "episodeTitle": "${episodeTitle || "..."}",
  "tagline": "...",
  "durationMinutes": ${Number(targetDuration) || 5},
  "showNotes": ["...", "..."],
  "chapters": [
    { "timestamp": "00:00", "title": "..." }
  ],
  "dialogue": [
    {
      "speaker": "${host}",
      "role": "host",
      "text": "...",
      "durationSec": 8
    },
    {
      "speaker": "${guest}",
      "role": "guest",
      "text": "...",
      "durationSec": 9
    }
  ]
}`;

    const selectedModel =
      model === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-4-hydrogen";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonResponse(response.text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("[/api/podcast/generate] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 5b. Real Dual-Speaker Podcast WAV Audio Synthesis (gemini-3.8-flash-tts)
app.post("/api/podcast/audio", async (req: Request, res: Response) => {
  try {
    const { dialogue, hostVoice, guestVoice } = req.body;
    if (!Array.isArray(dialogue) || dialogue.length === 0) {
      return res.status(400).json({ error: "Podcast dialogue turns are required." });
    }

    const ai = getAIClient();
    const speakers = Array.from(new Set(dialogue.map((d: any) => d.speaker))).slice(0, 2);
    const speakerA = String(speakers[0] || "Host");
    const speakerB = String(speakers[1] || "Guest");

    const parts = dialogue.map((turn: any) => {
      const spk = turn.speaker === speakerB ? speakerB : speakerA;
      return {
        text: `${spk}: ${turn.text}`,
        speechMetadata: {
          speaker: spk,
          style:
            turn.role === "host"
              ? "Engaging, articulate podcast host"
              : "Authoritative, conversational subject expert",
        },
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-tts",
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speakerA,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: hostVoice || "Kore" },
                },
              },
              {
                speaker: speakerB,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: guestVoice || "Fenrir" },
                },
              },
            ],
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Audio synthesis returned empty audio data.");
    }

    return res.json({
      mimeType: "audio/wav",
      audioBase64: base64Audio,
    });
  } catch (err: any) {
    console.error("[/api/podcast/audio] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 6. Video Storyboard & Scene Production API
app.post("/api/video/generate", async (req: Request, res: Response) => {
  try {
    const { blogPost, customTopic, videoFormat, targetDuration, model } = req.body;
    const ai = getAIClient();

    const blogContent = typeof blogPost === "string" ? blogPost : blogPost?.content || "";
    const blogTitle = typeof blogPost === "object" && blogPost?.title ? blogPost.title : "";

    if (!blogContent.trim() && !customTopic?.trim()) {
      return res.status(400).json({ error: "Provide a blog post or topic prompt to generate a video." });
    }

    const durationSec = Math.max(20, Math.min(180, Number(targetDuration) || 60));
    const sceneCount = Math.max(4, Math.min(8, Math.round(durationSec / 11)));
    const formatLabel = videoFormat || "16:9 Landscape";

    const prompt = `You are a video director and motion graphics producer.
Convert the following source material into a tight, production-ready ${sceneCount}-scene video script & storyboard.

${blogTitle ? `BLOG TITLE: ${blogTitle}` : ""}
${customTopic ? `CUSTOM FOCUS / BRIEF: ${customTopic}` : ""}
SOURCE CONTENT:
${(blogContent || customTopic || "").slice(0, 12000)}

SPECIFICATIONS:
- Aspect Format: ${formatLabel}
- Total Target Duration: ~${durationSec} seconds across ${sceneCount} scenes.
- Keep onScreenText punchy (max 10 words per scene) so it renders cleanly in video frames.
- Write voiceoverNarration specifically to be spoken aloud at ~2.4 words/sec matching each scene's durationSeconds.
- Provide specific visualDescription (motion, layout, focal graphic) and aiImagePrompt for each scene.

Return JSON only:
{
  "videoTitle": "...",
  "format": "${formatLabel}",
  "totalDurationSeconds": ${durationSec},
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Short scene label",
      "durationSeconds": 10,
      "visualDescription": "Specific visual framing and motion description",
      "aiImagePrompt": "Detailed visual prompt",
      "onScreenText": "SHORT PUNCHY HEADLINE",
      "voiceoverNarration": "Natural spoken voiceover sentence..."
    }
  ]
}`;

    const selectedModel =
      model === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-4-hydrogen";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = parseJsonResponse<{
      videoTitle: string;
      format?: string;
      totalDurationSeconds?: number;
      scenes: any[];
    }>(response.text);

    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    if (scenes.length === 0) {
      throw new Error("Model returned an empty scene list.");
    }

    const normalizedScenes = scenes.map((s: any, idx: number) => ({
      sceneNumber: idx + 1,
      title: String(s.title || `Scene ${idx + 1}`),
      durationSeconds: Math.max(4, Number(s.durationSeconds) || 10),
      visualDescription: String(s.visualDescription || ""),
      aiImagePrompt: String(s.aiImagePrompt || ""),
      onScreenText: String(s.onScreenText || s.title || ""),
      voiceoverNarration: String(s.voiceoverNarration || ""),
    }));

    const total = normalizedScenes.reduce((acc, s) => acc + s.durationSeconds, 0);

    return res.json({
      videoTitle: parsed.videoTitle || blogTitle || customTopic || "Generated Video",
      format: parsed.format || formatLabel,
      totalDurationSeconds: total,
      scenes: normalizedScenes,
    });
  } catch (err: any) {
    console.error("[/api/video/generate] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 6b. Real Video Scene Voiceover TTS (gemini-3.8-flash-lite-tts)
app.post("/api/video/voiceover", async (req: Request, res: Response) => {
  try {
    const { text, voiceName, style } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Voiceover text is required." });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: style || "Crisp, authoritative documentary narrator",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Voiceover synthesis returned empty audio data.");
    }

    return res.json({
      mimeType: "audio/wav",
      audioBase64: base64Audio,
    });
  } catch (err: any) {
    console.error("[/api/video/voiceover] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 7. Webhook Push Proxy for real CMS publishing
app.post("/api/publish/webhook", async (req: Request, res: Response) => {
  try {
    const { webhookUrl, payload } = req.body;
    if (!webhookUrl || typeof webhookUrl !== "string") {
      return res.status(400).json({ error: "Webhook URL is required." });
    }
    const parsedUrl = new URL(webhookUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Webhook URL must use http or https." });
    }

    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const bodyText = await upstream.text();
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Webhook returned HTTP ${upstream.status}: ${bodyText.slice(0, 200)}`,
      });
    }

    return res.json({ ok: true, status: upstream.status, response: bodyText.slice(0, 300) });
  } catch (err: any) {
    console.error("[/api/publish/webhook] Error:", err);
    return res.status(500).json({ error: getErrorMessage(err) });
  }
});

// Vite Middleware mounting in development or Static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] OmniContent Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
