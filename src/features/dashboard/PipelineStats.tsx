import {
  IconFolders,
  IconSparkles,
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconClock,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/context/ContentContext";

export function PipelineStats() {
  const { sources, pitchState, blogPosts, podcastEpisodes, videoStoryboards } = useContent();

  const selectedSources = sources.filter((s) => s.selectedForPitch).length;
  const totalWords = blogPosts.reduce(
    (acc, post) => acc + post.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const avgWords = blogPosts.length > 0 ? Math.round(totalWords / blogPosts.length) : 0;
  const totalVideoSeconds = videoStoryboards.reduce(
    (acc, v) => acc + (v.totalDurationSeconds || 0),
    0
  );
  const readyVoiceClips = videoStoryboards.reduce(
    (acc, v) => acc + v.scenes.filter((s) => !!s.audioDataUrl).length,
    0
  );
  const readyPodcastAudio = podcastEpisodes.filter((p) => !!p.audioDataUrl).length;

  const stats = [
    {
      title: "Sources Ingested",
      value: sources.length,
      subtitle: `${selectedSources} selected for synthesis`,
      icon: IconFolders,
    },
    {
      title: "Pitch Angles",
      value: pitchState?.pitches.length || 0,
      subtitle: `${pitchState?.curatedHighlights.length || 0} extracted highlights`,
      icon: IconSparkles,
    },
    {
      title: "Blog Posts",
      value: blogPosts.length,
      subtitle: blogPosts.length > 0 ? `${avgWords.toLocaleString()} avg words` : "No drafts yet",
      icon: IconFileText,
    },
    {
      title: "Podcast Episodes",
      value: podcastEpisodes.length,
      subtitle: `${readyPodcastAudio} with synthesized audio`,
      icon: IconHeadphones,
    },
    {
      title: "Video Projects",
      value: videoStoryboards.length,
      subtitle: `${totalVideoSeconds}s total · ${readyVoiceClips} voiced scenes`,
      icon: IconVideo,
    },
    {
      title: "Total Words",
      value: totalWords.toLocaleString(),
      subtitle: `${blogPosts.filter((b) => b.status === "published").length} published`,
      icon: IconClock,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {stat.title}
                </span>
                <Icon className="size-4 text-primary shrink-0" />
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {stat.value}
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {stat.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
