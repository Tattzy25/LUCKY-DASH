import { useState, useEffect } from "react";
import {
  IconVideo,
  IconSparkles,
  IconDownload,
  IconArrowLeft,
  IconVolume,
  IconMovie,
  IconTrash,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { VideoPlayerPreview } from "@/features/video/VideoPlayerPreview";
import { SceneStoryboardList } from "@/features/video/SceneStoryboardList";
import {
  renderStoryboardToWebm,
  synthesizeVoiceoverAudio,
} from "@/features/video/videoRenderer";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";

const VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

export function VideoView() {
  const {
    videoStoryboards,
    activeVideo,
    setActiveVideo,
    updateVideoStoryboard,
    deleteVideoStoryboard,
    activeBlogPost,
    blogPosts,
    generateVideo,
    isGeneratingVideo,
    setActiveTab,
  } = useContent();

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [videoFormat, setVideoFormat] = useState(activeVideo?.format || "16:9 Landscape");
  const [targetDuration, setTargetDuration] = useState("60");
  const [voiceName, setVoiceName] = useState(activeVideo?.voiceName || "Kore");
  const [customTopic, setCustomTopic] = useState("");
  const [isSynthesizingAll, setIsSynthesizingAll] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState("");
  const [renderPct, setRenderPct] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setActiveSceneIndex(0);
    setRenderedVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (activeVideo?.format) setVideoFormat(activeVideo.format);
    if (activeVideo?.voiceName) setVoiceName(activeVideo.voiceName);
  }, [activeVideo?.id]);

  const handleGenerateNew = async () => {
    await generateVideo(activeBlogPost || blogPosts[0] || undefined, {
      videoFormat,
      targetDuration: Number(targetDuration) || 60,
      customTopic: customTopic.trim() || undefined,
      voiceName,
    });
  };

  const handleSynthesizeAllVoiceovers = async (): Promise<typeof activeVideo> => {
    if (!activeVideo) return null;
    setIsSynthesizingAll(true);
    try {
      const updatedScenes = [...activeVideo.scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        if (!scene.voiceoverNarration.trim()) continue;
        setRenderStatus(`Generating voiceover ${i + 1} of ${updatedScenes.length}...`);
        setRenderPct(Math.round(((i + 1) / updatedScenes.length) * 100));
        const audioDataUrl = await synthesizeVoiceoverAudio(scene.voiceoverNarration, voiceName);
        updatedScenes[i] = { ...scene, audioDataUrl };
      }
      const next = { ...activeVideo, voiceName, scenes: updatedScenes };
      updateVideoStoryboard(next);
      toast.success("All scene voiceovers generated.");
      return next;
    } catch (err: any) {
      toast.error(err?.message || "Failed generating voiceovers.");
      return null;
    } finally {
      setIsSynthesizingAll(false);
      setRenderStatus("");
      setRenderPct(0);
    }
  };

  const handleRenderVideo = async () => {
    if (!activeVideo || activeVideo.scenes.length === 0) return;

    let workingStoryboard = activeVideo;
    const missingVoice = activeVideo.scenes.some(
      (s) => s.voiceoverNarration.trim() && !s.audioDataUrl
    );
    if (missingVoice) {
      const synthesized = await handleSynthesizeAllVoiceovers();
      if (!synthesized) return;
      workingStoryboard = synthesized;
    }

    setIsRendering(true);
    setRenderPct(0);
    setRenderStatus("Starting video render...");
    try {
      const blob = await renderStoryboardToWebm(workingStoryboard, (status, pct) => {
        setRenderStatus(status);
        setRenderPct(pct);
      });
      const url = URL.createObjectURL(blob);
      setRenderedVideoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      toast.success("Video compiled (.WebM) and ready to play or download.");
    } catch (err: any) {
      toast.error(err?.message || "Video rendering failed.");
    } finally {
      setIsRendering(false);
      setRenderStatus("");
      setRenderPct(0);
    }
  };

  const handleDownloadRenderedVideo = () => {
    if (!renderedVideoUrl || !activeVideo) return;
    const a = document.createElement("a");
    a.href = renderedVideoUrl;
    a.download = `${activeVideo.videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "video"}.webm`;
    a.click();
  };

  const handleDownloadSRT = () => {
    if (!activeVideo) return;
    let srt = "";
    let currentTime = 0;

    activeVideo.scenes.forEach((scene, i) => {
      const startSec = currentTime;
      const endSec = currentTime + scene.durationSeconds;
      currentTime = endSec;

      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},000`;
      };

      srt += `${i + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${scene.voiceoverNarration}\n\n`;
    });

    const blob = new Blob([srt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles-${activeVideo.videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceLabel =
    activeVideo?.sourceTitle ||
    blogPosts.find((b) => b.id === activeVideo?.blogPostId)?.title ||
    activeBlogPost?.title ||
    "Custom Brief";

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <IconVideo className="size-5 text-primary" />
              Video Production Studio
            </CardTitle>
            <CardDescription className="text-xs">
              {activeVideo ? (
                <>
                  <span>Source: {sourceLabel}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activeVideo.scenes.length} scenes</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activeVideo.totalDurationSeconds}s</span>
                </>
              ) : (
                "Generate a timed scene script, synthesize voiceover narration, edit scenes, and render a downloadable .WebM video."
              )}
            </CardDescription>
          </div>

          <ButtonGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("blog")}
              className="text-xs h-8 cursor-pointer"
            >
              <IconArrowLeft className="size-3.5 mr-1" />
              Blog Studio
            </Button>

            {activeVideo && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSRT}
                  className="text-xs h-8 cursor-pointer"
                >
                  <IconDownload className="size-3.5 mr-1" />
                  Export .SRT
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSynthesizeAllVoiceovers}
                  disabled={isSynthesizingAll || isRendering}
                  className="text-xs h-8 cursor-pointer"
                >
                  {isSynthesizingAll ? <Spinner className="size-3.5 mr-1" /> : <IconVolume className="size-3.5 mr-1" />}
                  Generate Voiceovers
                </Button>

                <Button
                  size="sm"
                  onClick={handleRenderVideo}
                  disabled={isRendering || isSynthesizingAll}
                  className="text-xs h-8 cursor-pointer"
                >
                  {isRendering ? <Spinner className="size-3.5 mr-1" /> : <IconMovie className="size-3.5 mr-1" />}
                  Render Video (.WebM)
                </Button>
              </>
            )}
          </ButtonGroup>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <Field className="md:col-span-4 gap-1.5">
              <FieldLabel className="text-xs">Topic or Script Brief</FieldLabel>
              <Input
                placeholder={
                  activeBlogPost
                    ? `Optional focus (uses "${activeBlogPost.title.slice(0, 28)}...")`
                    : "Enter a video topic or script brief..."
                }
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            <Field className="md:col-span-2 gap-1.5">
              <FieldLabel className="text-xs">Aspect Format</FieldLabel>
              <Select value={videoFormat} onValueChange={setVideoFormat}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9 Landscape">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16 Vertical">9:16 Vertical</SelectItem>
                  <SelectItem value="1:1 Square">1:1 Square</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="md:col-span-2 gap-1.5">
              <FieldLabel className="text-xs">Target Length</FieldLabel>
              <Select value={targetDuration} onValueChange={setTargetDuration}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">~30 Seconds</SelectItem>
                  <SelectItem value="60">~60 Seconds</SelectItem>
                  <SelectItem value="90">~90 Seconds</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="md:col-span-2 gap-1.5">
              <FieldLabel className="text-xs">Narrator Voice</FieldLabel>
              <Select value={voiceName} onValueChange={setVoiceName}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="md:col-span-2">
              <Button
                onClick={handleGenerateNew}
                disabled={isGeneratingVideo || isRendering}
                className="w-full h-9 text-xs cursor-pointer"
              >
                {isGeneratingVideo ? (
                  <>
                    <Spinner className="size-3.5 mr-1.5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconSparkles className="size-3.5 mr-1.5" />
                    {activeVideo ? "New Storyboard" : "Generate Video"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {videoStoryboards.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Field orientation="horizontal" className="flex-1 min-w-[240px]">
                  <FieldLabel className="text-xs text-muted-foreground shrink-0">
                    Saved Videos
                  </FieldLabel>
                  <Select
                    value={activeVideo?.id || ""}
                    onValueChange={(id) => {
                      const found = videoStoryboards.find((v) => v.id === id);
                      if (found) setActiveVideo(found);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs max-w-md">
                      <SelectValue placeholder="Select storyboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoStoryboards.map((sb) => (
                        <SelectItem key={sb.id} value={sb.id}>
                          {sb.videoTitle} ({sb.format} · {sb.scenes.length} scenes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {activeVideo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteVideoStoryboard(activeVideo.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <IconTrash className="size-3.5 mr-1" />
                    Delete Storyboard
                  </Button>
                )}
              </div>
            </>
          )}

          {(isSynthesizingAll || isRendering) && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{renderStatus}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{renderPct}%</span>
              </div>
              <Progress value={renderPct} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {!activeVideo ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconVideo />
            </EmptyMedia>
            <EmptyTitle>No video project yet</EmptyTitle>
            <EmptyDescription>
              Enter a topic above or select an existing blog post, choose your format and voice, and generate a video.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={handleGenerateNew}
              disabled={isGeneratingVideo}
              className="text-xs h-9 cursor-pointer"
            >
              {isGeneratingVideo ? <Spinner className="size-3.5 mr-1.5" /> : <IconSparkles className="size-3.5 mr-1.5" />}
              Generate Video Storyboard
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <VideoPlayerPreview
            storyboard={activeVideo}
            activeSceneIndex={activeSceneIndex}
            onSceneChange={setActiveSceneIndex}
            renderedVideoUrl={renderedVideoUrl}
            onDownloadRenderedVideo={handleDownloadRenderedVideo}
          />

          <SceneStoryboardList
            storyboard={activeVideo}
            activeSceneIndex={activeSceneIndex}
            voiceName={voiceName}
            onSelectScene={setActiveSceneIndex}
            onUpdateStoryboard={updateVideoStoryboard}
          />
        </>
      )}
    </div>
  );
}
