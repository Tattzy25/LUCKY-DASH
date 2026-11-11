import { IconMicrophone, IconUser, IconPlayerPlay } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PodcastEpisode } from "@/types/content";

interface PodcastScriptViewerProps {
  episode: PodcastEpisode;
  currentTurnIndex: number;
  onSelectTurn: (index: number) => void;
}

export function PodcastScriptViewer({
  episode,
  currentTurnIndex,
  onSelectTurn,
}: PodcastScriptViewerProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Dual-Speaker Broadcast Dialogue Script</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any conversational turn to jump the audio playback
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {episode.dialogue.length} Dialogue Turns
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {episode.dialogue.map((turn, idx) => {
          const isActive = currentTurnIndex === idx;
          const isHost = turn.role === "host";

          return (
            <div
              key={idx}
              onClick={() => onSelectTurn(idx)}
              className={`group flex items-start gap-3 rounded-lg border p-3.5 transition-all cursor-pointer ${
                isActive
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              {/* Speaker Avatar / Role Icon */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isHost
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {isHost ? (
                  <IconMicrophone className="size-4" />
                ) : (
                  <IconUser className="size-4" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      {turn.speaker}
                    </span>
                    <Badge
                      variant={isHost ? "default" : "secondary"}
                      className="text-[9px] uppercase font-mono px-1.5 py-0 h-4"
                    >
                      {turn.role}
                    </Badge>
                    {isActive && (
                      <span className="text-[10px] text-primary font-semibold animate-pulse">
                        ● Now Playing
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    ~{turn.durationSec || 6}s
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  {turn.text}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <IconPlayerPlay className="size-3.5 text-primary" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
