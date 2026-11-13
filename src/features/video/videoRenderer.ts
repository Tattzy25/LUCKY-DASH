import type { VideoScene, VideoStoryboard } from "@/types/content";

export function getVideoDimensions(format: string): { width: number; height: number; aspectClass: string } {
  const lower = (format || "").toLowerCase();
  if (lower.includes("9:16") || lower.includes("vertical")) {
    return { width: 720, height: 1280, aspectClass: "aspect-[9/16] max-h-[540px] mx-auto" };
  }
  if (lower.includes("1:1") || lower.includes("square")) {
    return { width: 1080, height: 1080, aspectClass: "aspect-square max-h-[520px] mx-auto" };
  }
  return { width: 1280, height: 720, aspectClass: "aspect-video w-full" };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

export function drawSceneFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: VideoScene,
  sceneIndex: number,
  totalScenes: number,
  progressInScene: number,
  videoTitle: string
) {
  const isVertical = height > width;
  const padX = Math.round(width * 0.07);
  const padY = Math.round(height * 0.07);
  const t = Math.max(0, Math.min(1, progressInScene));

  // Background gradient with subtle drift
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#070b14");
  bg.addColorStop(0.55, "#0d172a");
  bg.addColorStop(1, "#091220");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Moving subtle accent glow
  const glowX = width * (0.25 + 0.5 * ((sceneIndex % 2 === 0 ? t : 1 - t)));
  const glowY = height * 0.35;
  const radial = ctx.createRadialGradient(glowX, glowY, 20, glowX, glowY, width * 0.55);
  radial.addColorStop(0, "rgba(14, 165, 233, 0.22)");
  radial.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Subtle architectural grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
  ctx.lineWidth = 1;
  const step = Math.round(width / 16);
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Entrance fade/slide animation
  const ease = Math.min(1, t / 0.14);
  const alpha = ease;
  const slideY = (1 - ease) * 18;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Top bar: Video title + Scene counter
  ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
  ctx.font = `600 ${isVertical ? 22 : 18}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(videoTitle.slice(0, 56), padX, padY);

  const sceneLabel = `SCENE ${sceneIndex + 1} / ${totalScenes}`;
  const labelWidth = ctx.measureText(sceneLabel).width;
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(sceneLabel, width - padX - labelWidth, padY);

  // Scene section tag
  const tagY = padY + (isVertical ? 88 : 66) + slideY;
  ctx.fillStyle = "#38bdf8";
  ctx.font = `700 ${isVertical ? 24 : 20}px ui-monospace, SFMono-Regular, monospace`;
  ctx.fillText(scene.title.toUpperCase(), padX, tagY);

  // Accent divider bar
  const barWidth = Math.round(width * 0.14 * Math.min(1, t * 4 + 0.25));
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(padX, tagY + (isVertical ? 36 : 30), barWidth, 4);

  // Main kinetic headline (onScreenText)
  const headlineSize = isVertical ? 54 : 52;
  ctx.font = `800 ${headlineSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#f8fafc";
  const headlineLines = wrapText(ctx, scene.onScreenText || scene.title, width - padX * 2).slice(0, 4);
  let cursorY = tagY + (isVertical ? 76 : 64);
  const headlineLineHeight = Math.round(headlineSize * 1.18);
  for (const line of headlineLines) {
    ctx.fillText(line, padX, cursorY);
    cursorY += headlineLineHeight;
  }

  // Visual cue card
  if (scene.visualDescription) {
    const descY = cursorY + 24;
    ctx.font = `500 ${isVertical ? 24 : 21}px system-ui, -apple-system, sans-serif`;
    const descLines = wrapText(ctx, scene.visualDescription, width - padX * 2 - 40).slice(0, 3);
    const boxHeight = descLines.length * 30 + 28;

    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(padX, descY, width - padX * 2, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    descLines.forEach((line, i) => {
      ctx.fillText(line, padX + 20, descY + 14 + i * 30);
    });
  }

  // Bottom voiceover caption bar
  if (scene.voiceoverNarration) {
    ctx.font = `500 ${isVertical ? 26 : 23}px system-ui, -apple-system, sans-serif`;
    const subLines = wrapText(ctx, scene.voiceoverNarration, width - padX * 2 - 48).slice(0, 3);
    const subLineHeight = isVertical ? 34 : 31;
    const subHeight = subLines.length * subLineHeight + 28;
    const subY = height - padY - 26 - subHeight;

    ctx.fillStyle = "rgba(2, 6, 23, 0.86)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(padX, subY, width - padX * 2, subHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f1f5f9";
    subLines.forEach((line, i) => {
      const lw = ctx.measureText(line).width;
      ctx.fillText(line, Math.max(padX + 24, (width - lw) / 2), subY + 14 + i * subLineHeight);
    });
  }

  ctx.restore();

  // Bottom timeline bar across all scenes
  const barY = height - padY + 6;
  const totalBarW = width - padX * 2;
  const segGap = 6;
  const segW = (totalBarW - segGap * (totalScenes - 1)) / Math.max(1, totalScenes);

  for (let i = 0; i < totalScenes; i++) {
    const sx = padX + i * (segW + segGap);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(sx, barY, segW, 6);

    if (i < sceneIndex) {
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(sx, barY, segW, 6);
    } else if (i === sceneIndex) {
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(sx, barY, segW * t, 6);
    }
  }
}

export async function synthesizeVoiceoverAudio(
  text: string,
  voiceName = "Kore"
): Promise<string> {
  const res = await fetch("/api/video/voiceover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceName }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Voiceover failed (${res.status})`);
  }
  return `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`;
}

export async function renderStoryboardToWebm(
  storyboard: VideoStoryboard,
  onProgress?: (status: string, pct: number) => void
): Promise<Blob> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Video recording is not supported in this browser.");
  }

  const { width, height } = getVideoDimensions(storyboard.format);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas.");

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const dest = audioCtx.createMediaStreamDestination();

  // Pre-decode any scene audio buffers so timing matches real voiceovers
  const decodedBuffers: (AudioBuffer | null)[] = [];
  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i];
    onProgress?.(`Preparing scene ${i + 1} of ${storyboard.scenes.length}...`, Math.round((i / storyboard.scenes.length) * 15));
    if (scene.audioDataUrl) {
      try {
        const resp = await fetch(scene.audioDataUrl);
        const arrBuf = await resp.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrBuf);
        decodedBuffers.push(decoded);
      } catch {
        decodedBuffers.push(null);
      }
    } else {
      decodedBuffers.push(null);
    }
  }

  const canvasStream = canvas.captureStream(30);
  const combinedTracks = [
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ];
  const combinedStream = new MediaStream(combinedTracks);

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 3_500_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close().catch(() => {});
      resolve(new Blob(chunks, { type: "video/webm" }));
    };
    recorder.onerror = (e) => {
      audioCtx.close().catch(() => {});
      reject(new Error(`Video encoder error: ${(e as any)?.error?.message || "unknown"}`));
    };
  });

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  recorder.start(250);

  const totalScenes = storyboard.scenes.length;
  for (let idx = 0; idx < totalScenes; idx++) {
    const scene = storyboard.scenes[idx];
    const audioBuf = decodedBuffers[idx];
    const durationMs = audioBuf
      ? Math.max(scene.durationSeconds * 1000, Math.ceil(audioBuf.duration * 1000) + 300)
      : Math.max(2000, scene.durationSeconds * 1000);

    if (audioBuf) {
      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(dest);
      src.start();
    }

    const startTime = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        drawSceneFrame(ctx, width, height, scene, idx, totalScenes, progress, storyboard.videoTitle);

        const overallPct = Math.round(15 + ((idx + progress) / totalScenes) * 85);
        onProgress?.(`Rendering scene ${idx + 1} of ${totalScenes}...`, overallPct);

        if (elapsed >= durationMs) {
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  recorder.stop();
  return stopped;
}
