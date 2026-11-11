import { useState } from "react";
import { IconMovie, IconClock, IconCopy, IconCheck, IconPlayerPlay } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VideoStoryboard } from "@/types/content";

interface SceneStoryboardListProps {
  storyboard: VideoStoryboard;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
}

export function SceneStoryboardList({
  storyboard,
  activeSceneIndex,
  onSelectScene,
}: SceneStoryboardListProps) {
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  const handleCopyPrompt = (prompt: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Chronological Scene Sequence ({storyboard.scenes.length} Scenes)
        </h3>
        <span className="text-xs text-muted-foreground">
          Click any scene to preview in player
        </span>
      </div>

      <div className="space-y-3">
        {storyboard.scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <Card
              key={idx}
              onClick={() => onSelectScene(idx)}
              className={`cursor-pointer transition-all border ${
                isActive
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className="text-[10px] font-mono uppercase"
                    >
                      Scene {scene.sceneNumber}
                    </Badge>
                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                      {scene.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <IconClock className="size-3" />
                      {scene.durationSeconds}s
                    </span>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs px-2 cursor-pointer"
                    >
                      <IconPlayerPlay className="size-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* On-screen text & Visual Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 rounded border border-border/70 bg-muted/20 p-2.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      On-Screen Graphic Text
                    </div>
                    <div className="font-semibold text-foreground">
                      "{scene.onScreenText}"
                    </div>
                  </div>

                  <div className="space-y-1 rounded border border-border/70 bg-muted/20 p-2.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Visual Framing & Motion
                    </div>
                    <div className="text-muted-foreground leading-relaxed line-clamp-2">
                      {scene.visualDescription}
                    </div>
                  </div>
                </div>

                {/* Voiceover Narration */}
                <div className="space-y-1 text-xs border-l-2 border-primary/50 pl-3 py-0.5">
                  <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Voiceover Narration
                  </div>
                  <p className="text-foreground/90 italic leading-relaxed">
                    "{scene.voiceoverNarration}"
                  </p>
                </div>

                {/* AI Visual Prompt */}
                <div className="flex items-center justify-between gap-2 rounded bg-muted/40 p-2 text-xs">
                  <div className="truncate text-muted-foreground font-mono text-[11px] flex-1">
                    <strong className="text-foreground">Prompt: </strong>
                    {scene.aiImagePrompt}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleCopyPrompt(scene.aiImagePrompt, idx, e)}
                    className="h-6 text-[10px] px-2 shrink-0 cursor-pointer"
                  >
                    {copiedPromptIdx === idx ? (
                      <>
                        <IconCheck className="size-3 mr-1 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <IconCopy className="size-3 mr-1" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
