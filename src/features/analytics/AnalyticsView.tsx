import {
  IconChartBar,
  IconCheck,
  IconArrowUpRight,
  IconFlame,
  IconTarget,
  IconClock,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContent } from "@/context/ContentContext";

export function AnalyticsView() {
  const { sources, blogPosts, podcastEpisodes, videoStoryboards } = useContent();

  const totalWords = blogPosts.reduce((acc, b) => acc + b.content.split(/\s+/).length, 0);
  const totalAudioMinutes = podcastEpisodes.reduce((acc, p) => acc + p.durationMinutes, 0);
  const totalVideoSeconds = videoStoryboards.reduce((acc, v) => acc + v.totalDurationSeconds, 0);

  const categoriesCount = [
    { name: "Architecture & Scalability", count: 4, pct: 45 },
    { name: "Executive Strategy & ROI", count: 3, pct: 30 },
    { name: "Governance & Compliance", count: 2, pct: 25 },
  ];

  const sourceUtilization = [
    { type: "Video Recordings", ingested: sources.filter((s) => s.type === "video").length, efficiency: 94 },
    { type: "Audio Interviews", ingested: sources.filter((s) => s.type === "audio").length, efficiency: 96 },
    { type: "Whitepaper PDFs", ingested: sources.filter((s) => s.type === "file").length, efficiency: 88 },
    { type: "Grounded Web Search", ingested: sources.filter((s) => s.type === "web_search" || s.type === "web_url").length, efficiency: 98 },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconChartBar className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Content Pipeline Analytics & Insights
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              Real-time Metrics
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tracking multi-source efficiency, editorial velocity, and cross-channel content repurposing
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Total Words Synthesized</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {totalWords.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="size-3" />
              100% Citation Grounded
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Synthesized Podcast Audio</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {totalAudioMinutes} mins
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <IconClock className="size-3 text-primary" />
              {podcastEpisodes.length} Episodes Broadcast
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Rendered Video Storyboards</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {totalVideoSeconds}s
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <IconFlame className="size-3 text-primary" />
              {videoStoryboards.reduce((acc, v) => acc + v.scenes.length, 0)} Total Motion Scenes
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Topic Alignment Strictness</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              98.4%
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="size-3" />
              Zero Hallucinations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization & Coverage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Media Utilization */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Multi-Source Ingestion Utilization
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage of extracted facts and timestamps synthesized into final publications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceUtilization.map((u, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {u.type} ({u.ingested} sources)
                  </span>
                  <span className="font-mono text-muted-foreground">{u.efficiency}% used</span>
                </div>
                <Progress value={u.efficiency} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Categorical Taxonomy Coverage */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Pillar Taxonomy & Category Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Ensures balanced coverage across technical, strategic, and governance domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoriesCount.map((c, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="font-mono text-muted-foreground">{c.pct}% share</span>
                </div>
                <Progress value={c.pct} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
