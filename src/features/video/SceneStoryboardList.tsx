import { useState } from "react";
import {
  IconClock,
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconTrash,
  IconPlus,
  IconVolume,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { synthesizeVoiceoverAudio } from "@/features/video/videoRenderer";
import { toast } from "sonner";
import type { VideoScene, VideoStoryboard } from "@/types/content";

interface SceneStoryboardListProps {
  storyboard: VideoStoryboard;
  activeSceneIndex: number;
  voiceName: string;
  onSelectScene: (index: number) => void;
  onUpdateStoryboard: (updated: VideoStoryboard) => void;
}

export function SceneStoryboardList({
  storyboard,
  activeSceneIndex,
  voiceName,
  onSelectScene,
  onUpdateStoryboard,
}: SceneStoryboardListProps) {
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [synthesizingIdx, setSynthesizingIdx] = useState<number | null>(null);

  const handleSceneFieldChange = (
    idx: number,
    field: keyof VideoScene,
    value: string | number
  ) => {
    const nextScenes = storyboard.scenes.map((scene, i) => {
      if (i !== idx) return scene;
      const updated = { ...scene, [field]: value };
      if (field === "voiceoverNarration") {
        updated.audioDataUrl = undefined;
      }
      return updated;
    });
    onUpdateStoryboard({ ...storyboard, scenes: nextScenes });
  };

  const handleAddScene = () => {
    const newScene: VideoScene = {
      sceneNumber: storyboard.scenes.length + 1,
      title: `Scene ${storyboard.scenes.length + 1}`,
      durationSeconds: 10,
      onScreenText: "Key Takeaway",
      visualDescription: "Clean headline frame with animated progress bar and lower-third caption.",
      aiImagePrompt: "Minimalist studio graphic backdrop",
      voiceoverNarration: "Enter your spoken narration script for this scene.",
    };
    const next = { ...storyboard, scenes: [...storyboard.scenes, newScene] };
    onUpdateStoryboard(next);
    onSelectScene(next.scenes.length - 1);
  };

  const handleDeleteScene = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (storyboard.scenes.length <= 1) {
      toast.error("A storyboard needs at least 1 scene.");
      return;
    }
    const nextScenes = storyboard.scenes.filter((_, i) => i !== idx);
    onUpdateStoryboard({ ...storyboard, scenes: nextScenes });
    if (activeSceneIndex >= nextScenes.length) {
      onSelectScene(Math.max(0, nextScenes.length - 1));
    }
  };

  const handleMoveScene = (idx: number, dir: -1 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = idx + dir;
    if (target < 0 || target >= storyboard.scenes.length) return;
    const copy = [...storyboard.scenes];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    onUpdateStoryboard({ ...storyboard, scenes: copy });
    onSelectScene(target);
  };

  const handleGenerateSceneVoice = async (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const scene = storyboard.scenes[idx];
    if (!scene.voiceoverNarration.trim()) {
      toast.error("Add voiceover narration text first.");
      return;
    }
    setSynthesizingIdx(idx);
    try {
      const audioDataUrl = await synthesizeVoiceoverAudio(scene.voiceoverNarration, voiceName);
      const nextScenes = storyboard.scenes.map((s, i) =>
        i === idx ? { ...s, audioDataUrl } : s
      );
      onUpdateStoryboard({ ...storyboard, scenes: nextScenes });
      toast.success(`Voiceover ready for Scene ${idx + 1}.`);
    } catch (err: any) {
      toast.error(err?.message || "Voiceover synthesis failed.");
    } finally {
      setSynthesizingIdx(null);
    }
  };

  const handleCopyPrompt = (prompt: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Scene Editor ({storyboard.scenes.length} Scenes)
          </h3>
          <p className="text-xs text-muted-foreground">
            Edit any scene script, timing, or on-screen text and generate real voiceover audio
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddScene}
          className="h-8 text-xs gap-1.5 cursor-pointer"
        >
          <IconPlus className="size-3.5" />
          Add Scene
        </Button>
      </div>

      <div className="space-y-3">
        {storyboard.scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <Card
              key={`${scene.sceneNumber}-${idx}`}
              onClick={() => onSelectScene(idx)}
              className={`cursor-pointer transition-colors ${
                isActive ? "border-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                    Scene {idx + 1}
                  </span>
                  <span className="text-muted-foreground" aria-hidden="true">·</span>
                  <Input
                    value={scene.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSceneFieldChange(idx, "title", e.target.value)}
                    className="h-8 text-xs font-semibold max-w-xs"
                    aria-label={`Scene ${idx + 1} title`}
                  />
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <IconClock className="size-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      min={3}
                      max={60}
                      value={scene.durationSeconds}
                      onChange={(e) =>
                        handleSceneFieldChange(idx, "durationSeconds", Math.max(3, Number(e.target.value) || 8))
                      }
                      className="h-8 w-16 text-xs font-mono tabular-nums text-right"
                      aria-label={`Scene ${idx + 1} duration seconds`}
                    />
                    <span className="text-xs text-muted-foreground">s</span>
                  </div>

                  <ButtonGroup>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleGenerateSceneVoice(idx, e)}
                      disabled={synthesizingIdx === idx}
                      className="h-8 text-xs px-2.5 gap-1 cursor-pointer"
                    >
                      {synthesizingIdx === idx ? (
                        <Spinner className="size-3" />
                      ) : (
                        <IconVolume className="size-3" />
                      )}
                      {scene.audioDataUrl ? "Regenerate Voice" : "Generate Voice"}
                    </Button>

                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSelectScene(idx)}
                      className="h-8 text-xs px-2.5 cursor-pointer"
                    >
                      <IconPlayerPlay className="size-3 mr-1" />
                      Focus
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => handleMoveScene(idx, -1, e)}
                      disabled={idx === 0}
                      className="size-8 cursor-pointer"
                      title="Move up"
                    >
                      <IconArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => handleMoveScene(idx, 1, e)}
                      disabled={idx === storyboard.scenes.length - 1}
                      className="size-8 cursor-pointer"
                      title="Move down"
                    >
                      <IconArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => handleDeleteScene(idx, e)}
                      className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Delete scene"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </ButtonGroup>
                </div>
              </CardHeader>

              <CardContent className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field className="gap-1">
                    <FieldLabel className="text-xs text-muted-foreground">On-Screen Headline</FieldLabel>
                    <Input
                      value={scene.onScreenText}
                      onChange={(e) => handleSceneFieldChange(idx, "onScreenText", e.target.value)}
                      className="h-8 text-xs font-medium"
                    />
                  </Field>
                  <Field className="gap-1">
                    <FieldLabel className="text-xs text-muted-foreground">Visual Framing & Motion Notes</FieldLabel>
                    <Input
                      value={scene.visualDescription}
                      onChange={(e) => handleSceneFieldChange(idx, "visualDescription", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </Field>
                </div>

                <Field className="gap-1">
                  <FieldLabel className="text-xs text-muted-foreground">Voiceover Script</FieldLabel>
                  <Textarea
                    value={scene.voiceoverNarration}
                    onChange={(e) => handleSceneFieldChange(idx, "voiceoverNarration", e.target.value)}
                    rows={2}
                    className="text-xs resize-none"
                  />
                </Field>

                {scene.audioDataUrl && (
                  <Field orientation="horizontal" className="pt-1">
                    <FieldLabel className="text-xs shrink-0">Scene Audio</FieldLabel>
                    <audio controls src={scene.audioDataUrl} className="h-8 w-full max-w-md" />
                  </Field>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    value={scene.aiImagePrompt}
                    onChange={(e) => handleSceneFieldChange(idx, "aiImagePrompt", e.target.value)}
                    className="h-8 text-xs font-mono flex-1"
                    aria-label={`Scene ${idx + 1} visual prompt`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleCopyPrompt(scene.aiImagePrompt, idx, e)}
                    className="h-8 text-xs px-2.5 shrink-0 cursor-pointer"
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
