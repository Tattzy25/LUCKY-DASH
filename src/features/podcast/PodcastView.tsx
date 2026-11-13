import { useState } from "react";
import {
  IconHeadphones,
  IconRefresh,
  IconSparkles,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { PodcastPlayer } from "@/features/podcast/PodcastPlayer";
import { PodcastScriptViewer } from "@/features/podcast/PodcastScriptViewer";
import { ShowNotesCard } from "@/features/podcast/ShowNotesCard";
import { useContent } from "@/context/ContentContext";

export function PodcastView() {
  const {
    podcastEpisodes,
    activePodcast,
    setActivePodcast,
    updatePodcastEpisode,
    activeBlogPost,
    blogPosts,
    generatePodcast,
    isGeneratingPodcast,
    setActiveTab,
  } = useContent();

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  if (!activePodcast) {
    return (
      <div className="flex flex-1 p-6 max-w-7xl mx-auto w-full">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconHeadphones />
            </EmptyMedia>
            <EmptyTitle>No podcast episode yet</EmptyTitle>
            <EmptyDescription>
              Convert your active blog post into a dual-speaker podcast script and synthesize real audio.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => generatePodcast(activeBlogPost || blogPosts[0] || undefined)}
              disabled={isGeneratingPodcast}
              className="text-xs h-9 cursor-pointer"
            >
              <IconSparkles className="size-3.5 mr-1.5" />
              Generate Podcast Episode
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <IconHeadphones className="size-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Podcast Audio Studio
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            <span>{activePodcast.durationMinutes} min target</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Adapted from: {activeBlogPost?.title || "Blog Post"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {podcastEpisodes.length > 1 && (
            <Select
              value={activePodcast.id}
              onValueChange={(id) => {
                const found = podcastEpisodes.find((p) => p.id === id);
                if (found) setActivePodcast(found);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-56">
                <SelectValue placeholder="Switch episode" />
              </SelectTrigger>
              <SelectContent>
                {podcastEpisodes.map((ep) => (
                  <SelectItem key={ep.id} value={ep.id}>
                    {ep.episodeTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <ButtonGroup>
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
              onClick={() => generatePodcast(activeBlogPost || blogPosts[0] || undefined)}
              disabled={isGeneratingPodcast}
              className="text-xs h-8 cursor-pointer"
            >
              <IconRefresh className={`size-3.5 mr-1 ${isGeneratingPodcast ? "animate-spin" : ""}`} />
              Regenerate Script
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <PodcastPlayer
        episode={activePodcast}
        currentTurnIndex={currentTurnIndex}
        onTurnChange={setCurrentTurnIndex}
        onAudioGenerated={(audioDataUrl) =>
          updatePodcastEpisode({ ...activePodcast, audioDataUrl })
        }
      />

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
