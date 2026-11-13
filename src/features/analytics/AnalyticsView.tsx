import {
  IconChartBar,
  IconFlame,
  IconClock,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContent } from "@/context/ContentContext";

export function AnalyticsView() {
  const { sources, blogPosts, podcastEpisodes, videoStoryboards } = useContent();

  const totalWords = blogPosts.reduce(
    (acc, b) => acc + b.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const totalAudioMinutes = podcastEpisodes.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
  const totalVideoSeconds = videoStoryboards.reduce(
    (acc, v) => acc + (v.totalDurationSeconds || 0),
    0
  );
  const totalSources = sources.length || 1;

  const sourceBreakdown = [
    {
      type: "Video Sources",
      count: sources.filter((s) => s.type === "video").length,
    },
    {
      type: "Audio Sources",
      count: sources.filter((s) => s.type === "audio").length,
    },
    {
      type: "Document Files",
      count: sources.filter((s) => s.type === "file").length,
    },
    {
      type: "Web Search & URLs",
      count: sources.filter((s) => s.type === "web_search" || s.type === "web_url").length,
    },
  ].map((row) => ({
    ...row,
    pct: sources.length > 0 ? Math.round((row.count / totalSources) * 100) : 0,
  }));

  const categoryMap = new Map<string, number>();
  for (const post of blogPosts) {
    const cat = post.category || "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
    pct: blogPosts.length > 0 ? Math.round((count / blogPosts.length) * 100) : 0,
  }));

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2">
          <IconChartBar className="size-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Pipeline Analytics
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Live breakdown calculated directly from your sources, articles, podcasts, and video storyboards
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Total Words Written</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
              {totalWords.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Across {blogPosts.length} blog {blogPosts.length === 1 ? "post" : "posts"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Podcast Runtime Target</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
              {totalAudioMinutes} mins
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <IconClock className="size-3 text-primary" />
              {podcastEpisodes.filter((p) => !!p.audioDataUrl).length} of {podcastEpisodes.length} with WAV audio
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Video Storyboard Runtime</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
              {totalVideoSeconds}s
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <IconFlame className="size-3 text-primary" />
              {videoStoryboards.reduce((acc, v) => acc + v.scenes.length, 0)} scenes across {videoStoryboards.length} videos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Active Sources</span>
            <div className="text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
              {sources.filter((s) => s.selectedForPitch).length} / {sources.length}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Selected for synthesis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Source Type Distribution</CardTitle>
            <CardDescription className="text-xs">
              Share of ingested materials by format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceBreakdown.map((u, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {u.type} ({u.count})
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">{u.pct}%</span>
                </div>
                <Progress value={u.pct} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Blog Category Distribution</CardTitle>
            <CardDescription className="text-xs">
              Actual breakdown of generated blog categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No blog posts generated yet.
              </p>
            ) : (
              categoryBreakdown.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {c.name} ({c.count})
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">{c.pct}%</span>
                  </div>
                  <Progress value={c.pct} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
