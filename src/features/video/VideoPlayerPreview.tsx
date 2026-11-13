import { useState, useEffect, useRef } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconDownload,
  IconVideo,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { drawSceneFrame, getVideoDimensions } from "@/features/video/videoRenderer";
import type { VideoStoryboard } from "@/types/content";

interface VideoPlayerPreviewProps {
  storyboard: VideoStoryboard;
  activeSceneIndex: number;
  onSceneChange: (index: number) => void;
  renderedVideoUrl: string | null;
  onDownloadRenderedVideo: () => void;
}

export function VideoPlayerPreview({
  storyboard,
  activeSceneIndex,
  onSceneChange,
  renderedVideoUrl,
  onDownloadRenderedVideo,
}: VideoPlayerPreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "rendered">(
    renderedVideoUrl ? "rendered" : "preview"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeIndex = Math.min(activeSceneIndex, Math.max(0, storyboard.scenes.length - 1));
  const activeScene = storyboard.scenes[safeIndex];
  const { width, height } = getVideoDimensions(storyboard.format);
  const ratio = width / height;

  useEffect(() => {
    if (renderedVideoUrl) {
      setViewMode("rendered");
      setIsPlaying(false);
    } else {
      setViewMode("preview");
    }
  }, [renderedVideoUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeScene) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawSceneFrame(
      ctx,
      width,
      height,
      activeScene,
      safeIndex,
      storyboard.scenes.length,
      isPlaying ? sceneProgress : 1,
      storyboard.videoTitle
    );
  }, [activeScene, safeIndex, storyboard.scenes.length, storyboard.videoTitle, width, height, sceneProgress, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (viewMode !== "preview" || !isPlaying || !activeScene) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    let rafId = 0;
    let cancelled = false;
    const audioEl = audioRef.current;
    const fallbackDurationMs = Math.max(2000, (activeScene.durationSeconds || 8) * 1000);
    const startTime = performance.now();

    const advanceToNext = () => {
      if (cancelled) return;
      if (safeIndex + 1 < storyboard.scenes.length) {
        setSceneProgress(0);
        onSceneChange(safeIndex + 1);
      } else {
        setIsPlaying(false);
        setSceneProgress(0);
        onSceneChange(0);
      }
    };

    if (activeScene.audioDataUrl && audioEl) {
      audioEl.src = activeScene.audioDataUrl;
      audioEl.currentTime = 0;
      audioEl.muted = isMuted;
      audioEl.play().catch(() => {});

      const onEnded = () => advanceToNext();
      audioEl.addEventListener("ended", onEnded);

      const tickAudio = () => {
        if (cancelled) return;
        const dur = audioEl.duration && isFinite(audioEl.duration) ? audioEl.duration : activeScene.durationSeconds || 8;
        setSceneProgress(Math.min(1, audioEl.currentTime / Math.max(0.5, dur)));
        rafId = requestAnimationFrame(tickAudio);
      };
      rafId = requestAnimationFrame(tickAudio);

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
        audioEl.removeEventListener("ended", onEnded);
        audioEl.pause();
      };
    } else {
      const tickTimer = () => {
        if (cancelled) return;
        const elapsed = performance.now() - startTime;
        const pct = Math.min(1, elapsed / fallbackDurationMs);
        setSceneProgress(pct);
        if (elapsed >= fallbackDurationMs) {
          advanceToNext();
        } else {
          rafId = requestAnimationFrame(tickTimer);
        }
      };
      rafId = requestAnimationFrame(tickTimer);

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
      };
    }
  }, [viewMode, isPlaying, safeIndex, activeScene, storyboard.scenes.length, isMuted, onSceneChange]);

  if (!activeScene) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconVideo />
          </EmptyMedia>
          <EmptyTitle>No scenes in storyboard</EmptyTitle>
          <EmptyDescription>Add a scene below or regenerate the storyboard.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const totalDurationSec = storyboard.scenes.reduce((acc, s) => acc + (s.durationSeconds || 6), 0);
  const elapsedBeforeScene = storyboard.scenes
    .slice(0, safeIndex)
    .reduce((acc, s) => acc + (s.durationSeconds || 6), 0);
  const currentElapsedSec = Math.round(
    elapsedBeforeScene + (activeScene.durationSeconds || 6) * (isPlaying ? sceneProgress : 0)
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  const overallPercent =
    storyboard.scenes.length > 0
      ? ((safeIndex + (isPlaying ? sceneProgress : 0)) / storyboard.scenes.length) * 100
      : 0;

  return (
    <Card className="border-border overflow-hidden">
      {renderedVideoUrl && (
        <CardHeader className="flex flex-row items-center justify-between py-2.5 px-4 border-b border-border">
          <Tabs
            value={viewMode}
            onValueChange={(v) => {
              const mode = v as "preview" | "rendered";
              setViewMode(mode);
              if (mode === "rendered") setIsPlaying(false);
            }}
          >
            <TabsList className="h-8">
              <TabsTrigger value="rendered" className="text-xs cursor-pointer">
                Compiled Video (.WebM)
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs cursor-pointer">
                Scene Canvas Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            variant="secondary"
            onClick={onDownloadRenderedVideo}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <IconDownload className="size-3.5" />
            Download .WebM
          </Button>
        </CardHeader>
      )}

      {viewMode === "rendered" && renderedVideoUrl ? (
        <CardContent className="p-3 bg-black flex items-center justify-center">
          <div className={ratio < 1 ? "w-full max-w-[320px]" : ratio === 1 ? "w-full max-w-[520px]" : "w-full"}>
            <AspectRatio ratio={ratio}>
              <video src={renderedVideoUrl} controls className="w-full h-full rounded bg-black object-contain" />
            </AspectRatio>
          </div>
        </CardContent>
      ) : (
        <div ref={containerRef} className="bg-black flex flex-col">
          <audio ref={audioRef} className="hidden" />
          <div className="w-full flex items-center justify-center p-3">
            <div className={ratio < 1 ? "w-full max-w-[320px]" : ratio === 1 ? "w-full max-w-[520px]" : "w-full"}>
              <AspectRatio ratio={ratio}>
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  className="w-full h-full rounded border border-border/30"
                />
              </AspectRatio>
            </div>
          </div>

          <CardContent className="p-3 bg-card border-t border-border space-y-2.5">
            <Slider
              value={[overallPercent]}
              max={100}
              step={0.5}
              onValueChange={([val]) => {
                const targetIdx = Math.min(
                  storyboard.scenes.length - 1,
                  Math.floor((val / 100) * storyboard.scenes.length)
                );
                setSceneProgress(0);
                onSceneChange(Math.max(0, targetIdx));
              }}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSceneProgress(0);
                      onSceneChange(Math.max(0, safeIndex - 1));
                    }}
                    disabled={safeIndex === 0}
                    className="size-8 cursor-pointer"
                  >
                    <IconPlayerSkipBack className="size-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="size-8 cursor-pointer"
                  >
                    {isPlaying ? (
                      <IconPlayerPause className="size-4" />
                    ) : (
                      <IconPlayerPlay className="size-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSceneProgress(0);
                      onSceneChange(Math.min(storyboard.scenes.length - 1, safeIndex + 1));
                    }}
                    disabled={safeIndex >= storyboard.scenes.length - 1}
                    className="size-8 cursor-pointer"
                  >
                    <IconPlayerSkipForward className="size-4" />
                  </Button>
                </ButtonGroup>

                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {formatTime(currentElapsedSec)} / {formatTime(totalDurationSec)}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  · Scene {safeIndex + 1} of {storyboard.scenes.length}
                  {activeScene.audioDataUrl ? " · Voice Ready" : " · No Voice Audio"}
                </span>
              </div>

              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="size-8 cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <IconVolumeOff className="size-4" /> : <IconVolume className="size-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFullscreen}
                  className="size-8 cursor-pointer"
                  title="Fullscreen"
                >
                  <IconMaximize className="size-4" />
                </Button>
              </ButtonGroup>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}
