import { useState } from "react";
import {
  IconHeadphones,
  IconRefresh,
  IconSparkles,
  IconFileText,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PodcastPlayer } from "@/features/podcast/PodcastPlayer";
import { PodcastScriptViewer } from "@/features/podcast/PodcastScriptViewer";
import { ShowNotesCard } from "@/features/podcast/ShowNotesCard";
import { useContent } from "@/context/ContentContext";

export function PodcastView() {
  const {
    podcastEpisodes,
    activePodcast,
    setActivePodcast,
    activeBlogPost,
    generatePodcast,
    isGeneratingPodcast,
    setActiveTab,
  } = useContent();

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  if (!activePodcast) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center space-y-3">
        <IconHeadphones className="size-12 text-muted-foreground/50" />
        <h3 className="text-base font-semibold">No podcast generated yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Convert your active blog post into a dual-speaker conversational audio podcast episode.
        </p>
        <Button
          onClick={() => generatePodcast(activeBlogPost || undefined)}
          disabled={isGeneratingPodcast}
          className="text-xs h-8 cursor-pointer"
        >
          <IconSparkles className="size-3.5 mr-1" />
          Generate Podcast Episode
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconHeadphones className="size-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate max-w-xl">
              Podcast Audio Production Studio
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {activePodcast.durationMinutes} Min Episode
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>Adapted from blog:</span>
            <strong className="text-foreground truncate max-w-md">
              {activeBlogPost?.title || "Enterprise Publication"}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            size="sm"
            onClick={() => generatePodcast(activeBlogPost || undefined)}
            disabled={isGeneratingPodcast}
            className="text-xs h-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <IconRefresh className={`size-3.5 mr-1 ${isGeneratingPodcast ? "animate-spin" : ""}`} />
            Regenerate Script
          </Button>
        </div>
      </div>

      {/* Main Interactive Audio Player */}
      <PodcastPlayer
        episode={activePodcast}
        currentTurnIndex={currentTurnIndex}
        onTurnChange={setCurrentTurnIndex}
      />

      {/* Script & Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <PodcastScriptViewer
            episode={activePodcast}
            currentTurnIndex={currentTurnIndex}
            onSelectTurn={setCurrentTurnIndex}
          />
        </div>
        <div className="lg:col-span-4">
          <ShowNotesCard episode={activePodcast} />
        </div>
      </div>
    </div>
  );
}
