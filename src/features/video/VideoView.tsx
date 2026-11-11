import { useState } from "react";
import {
  IconVideo,
  IconRefresh,
  IconSparkles,
  IconDownload,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoPlayerPreview } from "@/features/video/VideoPlayerPreview";
import { SceneStoryboardList } from "@/features/video/SceneStoryboardList";
import { useContent } from "@/context/ContentContext";

export function VideoView() {
  const {
    activeVideo,
    activeBlogPost,
    generateVideo,
    isGeneratingVideo,
    setActiveTab,
  } = useContent();

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  if (!activeVideo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center space-y-3">
        <IconVideo className="size-12 text-muted-foreground/50" />
        <h3 className="text-base font-semibold">No video storyboard generated</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Convert your active blog post into a scene-by-scene motion storyboard with visual cues and voiceover.
        </p>
        <Button
          onClick={() => generateVideo(activeBlogPost || undefined)}
          disabled={isGeneratingVideo}
          className="text-xs h-8 cursor-pointer"
        >
          <IconSparkles className="size-3.5 mr-1" />
          Generate Video Storyboard
        </Button>
      </div>
    );
  }

  const handleDownloadSRT = () => {
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
        const ms = 0;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
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

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconVideo className="size-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate max-w-xl">
              Video Storyboard & Scene Production
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {activeVideo.scenes.length} Scenes • {activeVideo.totalDurationSeconds}s
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>Adapted from blog:</span>
            <strong className="text-foreground truncate max-w-md">
              {activeBlogPost?.title || "Enterprise Publication"}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("blog")}
            className="text-xs h-8 cursor-pointer"
          >
            <IconArrowLeft className="size-3.5 mr-1" />
            Back to Blog
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSRT}
            className="text-xs h-8 cursor-pointer"
          >
            <IconDownload className="size-3.5 mr-1" />
            Export Subtitles (.SRT)
          </Button>

          <Button
            size="sm"
            onClick={() => generateVideo(activeBlogPost || undefined)}
            disabled={isGeneratingVideo}
            className="text-xs h-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <IconRefresh className={`size-3.5 mr-1 ${isGeneratingVideo ? "animate-spin" : ""}`} />
            Regenerate Storyboard
          </Button>
        </div>
      </div>

      {/* Main Video Presentation Player */}
      <VideoPlayerPreview
        storyboard={activeVideo}
        activeSceneIndex={activeSceneIndex}
        onSceneChange={setActiveSceneIndex}
      />

      {/* Scene by Scene Sequence */}
      <SceneStoryboardList
        storyboard={activeVideo}
        activeSceneIndex={activeSceneIndex}
        onSelectScene={setActiveSceneIndex}
      />
    </div>
  );
}
