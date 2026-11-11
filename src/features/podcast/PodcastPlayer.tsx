import { useState, useEffect, useRef } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconVolume,
  IconVolumeOff,
  IconSparkles,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { PodcastEpisode } from "@/types/content";

interface PodcastPlayerProps {
  episode: PodcastEpisode;
  currentTurnIndex: number;
  onTurnChange: (index: number) => void;
}

export function PodcastPlayer({
  episode,
  currentTurnIndex,
  onTurnChange,
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const totalDurationSec = episode.dialogue.reduce((acc, d) => acc + (d.durationSec || 6), 0) || 180;
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakTurn = (index: number) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (index >= episode.dialogue.length) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    const turn = episode.dialogue[index];
    const utterance = new SpeechSynthesisUtterance(turn.text);
    utteranceRef.current = utterance;
    utterance.rate = playbackRate;

    // Pick voices if available
    const voices = synthRef.current.getVoices();
    if (voices.length > 0) {
      if (turn.role === "host") {
        // Prefer female or first voice
        const femaleVoice = voices.find((v) => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google US English"));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        // Prefer male or different voice
        const maleVoice = voices.find((v) => v.name.includes("Male") || v.name.includes("Daniel") || v.name.includes("Alex"));
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.onend = () => {
      if (index + 1 < episode.dialogue.length) {
        onTurnChange(index + 1);
        speakTurn(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (synthRef.current) synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakTurn(currentTurnIndex);
    }
  };

  const handleSkipNext = () => {
    if (currentTurnIndex + 1 < episode.dialogue.length) {
      onTurnChange(currentTurnIndex + 1);
      if (isPlaying) speakTurn(currentTurnIndex + 1);
    }
  };

  const handleSkipPrev = () => {
    if (currentTurnIndex > 0) {
      onTurnChange(currentTurnIndex - 1);
      if (isPlaying) speakTurn(currentTurnIndex - 1);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Calculate elapsed time from turns
  const currentElapsed = episode.dialogue
    .slice(0, currentTurnIndex)
    .reduce((acc, d) => acc + (d.durationSec || 6), 0);

  const activeTurn = episode.dialogue[currentTurnIndex] || episode.dialogue[0];

  return (
    <Card className="border-border bg-gradient-to-b from-card to-muted/20 shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Top Player Info & Active Speaker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/40 text-primary">
                AI Voice Synthesis
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {formatSeconds(currentElapsed)} / {formatSeconds(totalDurationSec)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {episode.episodeTitle}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {episode.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-2xs">
              <span className={`size-2.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"}`} />
              <div className="text-left text-xs">
                <div className="font-semibold text-foreground text-[11px]">
                  Speaking: {activeTurn?.speaker}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {activeTurn?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Audio Waveform */}
        <div className="h-14 w-full rounded-lg bg-background/80 border border-border/80 p-2 flex items-center justify-between gap-1 overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => {
            const isWaveActive = isPlaying && i % 3 === (currentTurnIndex % 3);
            const height = isPlaying
              ? Math.max(15, Math.sin(i * 0.4 + currentTurnIndex) * 80 + 30)
              : (i % 5) * 8 + 12;
            return (
              <div
                key={i}
                className={`w-full rounded-full transition-all duration-150 ${
                  i < (currentTurnIndex / episode.dialogue.length) * 48
                    ? "bg-primary"
                    : isWaveActive
                    ? "bg-primary/80"
                    : "bg-muted-foreground/30"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Playback Controls & Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Turn {currentTurnIndex + 1} of {episode.dialogue.length}</span>
            <span>{Math.round(((currentTurnIndex + 1) / episode.dialogue.length) * 100)}% Complete</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSkipPrev}
                disabled={currentTurnIndex === 0}
                className="size-8 cursor-pointer"
              >
                <IconPlayerSkipBack className="size-4" />
              </Button>

              <Button
                size="icon"
                onClick={handleTogglePlay}
                className="size-10 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                {isPlaying ? (
                  <IconPlayerPause className="size-5" />
                ) : (
                  <IconPlayerPlay className="size-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleSkipNext}
                disabled={currentTurnIndex >= episode.dialogue.length - 1}
                className="size-8 cursor-pointer"
              >
                <IconPlayerSkipForward className="size-4" />
              </Button>
            </div>

            {/* Speed & Volume Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rates = [1, 1.25, 1.5, 2];
                  const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
                  setPlaybackRate(rates[nextIdx]);
                }}
                className="text-xs h-8 px-2 font-mono cursor-pointer"
              >
                {playbackRate}x
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="size-8 cursor-pointer text-muted-foreground"
              >
                {isMuted ? <IconVolumeOff className="size-4" /> : <IconVolume className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
