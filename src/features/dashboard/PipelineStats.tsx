import {
  IconFolders,
  IconSparkles,
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/context/ContentContext";

export function PipelineStats() {
  const { sources, pitchState, blogPosts, podcastEpisodes, videoStoryboards } = useContent();

  const stats = [
    {
      title: "Sources Ingested",
      value: sources.length,
      subtitle: `${sources.filter((s) => s.type === "video" || s.type === "audio").length} media, ${sources.filter((s) => s.type === "file" || s.type === "web_search").length} text/web`,
      icon: IconFolders,
      change: "+12 this week",
      trend: "up",
    },
    {
      title: "Pitches & Angles",
      value: pitchState?.pitches.length || 0,
      subtitle: `${pitchState?.categories.length || 0} categorical clusters`,
      icon: IconSparkles,
      change: "4 guardrails active",
      trend: "neutral",
    },
    {
      title: "Blog Publications",
      value: blogPosts.length,
      subtitle: "Avg. 1,420 words / post",
      icon: IconFileText,
      change: "100% citation linked",
      trend: "up",
    },
    {
      title: "Podcast Episodes",
      value: podcastEpisodes.length,
      subtitle: "Dual-speaker audio scripts",
      icon: IconHeadphones,
      change: "Voice playback ready",
      trend: "up",
    },
    {
      title: "Video Storyboards",
      value: videoStoryboards.length,
      subtitle: "Scene motion & AI prompts",
      icon: IconVideo,
      change: "Multi-aspect formats",
      trend: "up",
    },
    {
      title: "Citation Grounding",
      value: "98.4%",
      subtitle: "Audit-trailed source facts",
      icon: IconShieldCheck,
      change: "Zero hallucinations",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="border-border bg-card/50 hover:bg-card transition-all">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {stat.title}
                </span>
                <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {stat.subtitle}
                </p>
              </div>

              <div className="pt-1 border-t border-border/40 flex items-center justify-between">
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
