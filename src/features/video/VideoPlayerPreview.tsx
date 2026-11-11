import { useState, useEffect, useRef } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconSparkles,
  IconMaximize,
  IconClock,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VideoStoryboard } from "@/types/content";

interface VideoPlayerPreviewProps {
  storyboard: VideoStoryboard;
  activeSceneIndex: number;
  onSceneChange: (index: number) => void;
}

export function VideoPlayerPreview({
  storyboard,
  activeSceneIndex,
  onSceneChange,
}: VideoPlayerPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const activeScene = storyboard.scenes[activeSceneIndex] || storyboard.scenes[0];

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Voice narration and auto-advance
  useEffect(() => {
    if (!isPlaying) {
      if (synthRef.current) synthRef.current.cancel();
      return;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(activeScene.voiceoverNarration);
      utterance.rate = 1.05;

      utterance.onend = () => {
        if (activeSceneIndex + 1 < storyboard.scenes.length) {
          onSceneChange(activeSceneIndex + 1);
        } else {
          setIsPlaying(false);
          onSceneChange(0);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      synthRef.current.speak(utterance);
    }
  }, [isPlaying, activeSceneIndex]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (activeSceneIndex + 1 < storyboard.scenes.length) {
      onSceneChange(activeSceneIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeSceneIndex > 0) {
      onSceneChange(activeSceneIndex - 1);
    }
  };

  return (
    <Card className="border-border overflow-hidden bg-black text-white shadow-md">
      {/* 16:9 Cinematic Video Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-slate-900 to-sky-950 flex flex-col justify-between p-6 sm:p-8 select-none">
        {/* Animated Cybernetic Grid Backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* Top Video Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
            <Badge variant="outline" className="text-[10px] uppercase font-mono text-primary border-primary/40 bg-black/60">
              Scene {activeScene.sceneNumber} of {storyboard.scenes.length}
            </Badge>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              {activeScene.durationSeconds}s Duration
            </span>
          </div>

          <Badge variant="secondary" className="text-[10px] font-mono bg-black/50 text-neutral-300">
            {storyboard.format}
          </Badge>
        </div>

        {/* Center Scene Title & Visual Preview Description */}
        <div className="relative z-10 my-auto text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-[11px] font-mono text-cyan-300 tracking-wide uppercase">
            {activeScene.title}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm uppercase">
            {activeScene.onScreenText}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 max-w-lg mx-auto bg-black/40 backdrop-blur rounded p-2 border border-white/10 font-mono text-[11px]">
            Visual: {activeScene.visualDescription}
          </p>
        </div>

        {/* Bottom Voiceover Narration Subtitles & Scrubber */}
        <div className="relative z-10 space-y-2">
          {/* Subtitle Banner */}
          <div className="rounded-lg bg-black/75 backdrop-blur border border-white/10 p-2.5 text-center">
            <p className="text-xs sm:text-sm text-neutral-100 font-medium italic">
              "{activeScene.voiceoverNarration}"
            </p>
          </div>

          {/* Progress Timeline Dots */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {storyboard.scenes.map((scene, idx) => (
              <button
                key={idx}
                onClick={() => onSceneChange(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  idx === activeSceneIndex
                    ? "bg-primary shadow-sm ring-1 ring-primary/80"
                    : idx < activeSceneIndex
                    ? "bg-primary/50"
                    : "bg-white/20"
                }`}
                title={`Scene ${scene.sceneNumber}: ${scene.title}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Player Bottom Controls Bar */}
      <CardContent className="p-3 bg-neutral-900 border-t border-border flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={activeSceneIndex === 0}
            className="size-8 text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <IconPlayerSkipBack className="size-4" />
          </Button>

          <Button
            size="icon"
            onClick={handleTogglePlay}
            className="size-9 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
          >
            {isPlaying ? (
              <IconPlayerPause className="size-4" />
            ) : (
              <IconPlayerPlay className="size-4 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={activeSceneIndex >= storyboard.scenes.length - 1}
            className="size-8 text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <IconPlayerSkipForward className="size-4" />
          </Button>

          <span className="text-xs text-neutral-400 font-mono ml-2">
            Scene {activeSceneIndex + 1} / {storyboard.scenes.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-neutral-300">
            Total {storyboard.totalDurationSeconds}s
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
