import { useState } from "react";
import {
  IconHeadphones,
  IconVolume,
  IconDownload,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { PodcastEpisode } from "@/types/content";

interface PodcastPlayerProps {
  episode: PodcastEpisode;
  currentTurnIndex: number;
  onTurnChange: (index: number) => void;
  onAudioGenerated: (audioDataUrl: string) => void;
}

const VOICES = ["Kore", "Fenrir", "Puck", "Charon", "Zephyr"];

export function PodcastPlayer({
  episode,
  currentTurnIndex,
  onAudioGenerated,
}: PodcastPlayerProps) {
  const [hostVoice, setHostVoice] = useState("Kore");
  const [guestVoice, setGuestVoice] = useState("Fenrir");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesizePodcast = async () => {
    if (!episode.dialogue || episode.dialogue.length === 0) {
      toast.error("No dialogue turns in this episode.");
      return;
    }

    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/podcast/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dialogue: episode.dialogue,
          hostVoice,
          guestVoice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Audio synthesis failed (${res.status})`);
      }
      const dataUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`;
      onAudioGenerated(dataUrl);
      toast.success("Dual-speaker podcast audio generated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate podcast audio.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDownloadWav = () => {
    if (!episode.audioDataUrl) return;
    const a = document.createElement("a");
    a.href = episode.audioDataUrl;
    a.download = `${episode.episodeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "podcast"}.wav`;
    a.click();
  };

  const activeTurn = episode.dialogue[currentTurnIndex] || episode.dialogue[0];

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconHeadphones className="size-4 text-primary" />
              <span>Dual-Speaker Audio Episode</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{episode.dialogue.length} turns</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {episode.episodeTitle}
            </h3>
            <p className="text-xs text-muted-foreground">{episode.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={hostVoice} onValueChange={setHostVoice}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Host voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => (
                  <SelectItem key={v} value={v}>
                    Host: {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={guestVoice} onValueChange={setGuestVoice}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Guest voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => (
                  <SelectItem key={v} value={v}>
                    Guest: {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ButtonGroup>
              <Button
                size="sm"
                onClick={handleSynthesizePodcast}
                disabled={isSynthesizing}
                className="h-8 text-xs cursor-pointer"
              >
                {isSynthesizing ? (
                  <>
                    <Spinner className="size-3.5 mr-1.5" />
                    Synthesizing Audio...
                  </>
                ) : (
                  <>
                    <IconVolume className="size-3.5 mr-1.5" />
                    {episode.audioDataUrl ? "Regenerate Audio" : "Generate Audio (.WAV)"}
                  </>
                )}
              </Button>

              {episode.audioDataUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadWav}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconDownload className="size-3.5 mr-1" />
                  Download .WAV
                </Button>
              )}
            </ButtonGroup>
          </div>
        </div>

        {episode.audioDataUrl ? (
          <Alert>
            <AlertDescription className="w-full space-y-2">
              <audio controls src={episode.audioDataUrl} className="w-full h-10" />
              {activeTurn && (
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{activeTurn.speaker}:</strong> {activeTurn.text}
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <IconVolume />
            <AlertDescription className="text-xs">
              Script ready ({episode.dialogue.length} dialogue turns). Click{" "}
              <strong className="text-foreground">Generate Audio (.WAV)</strong> to synthesize the dual-speaker recording.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
