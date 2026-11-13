import {
  IconPlus,
  IconSparkles,
  IconFolders,
  IconFileText,
  IconHeadphones,
  IconVideo,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PipelineStats } from "@/features/dashboard/PipelineStats";
import { InteractiveChart } from "@/features/dashboard/InteractiveChart";
import { RecentGenerationsTable } from "@/features/dashboard/RecentGenerationsTable";
import { useContent } from "@/context/ContentContext";

export function DashboardView() {
  const { setActiveTab, sources, pitchState } = useContent();

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Action Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Content Command Center
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Ingest video, audio, documents, URLs, or web search. Generate editorial angles, draft long-form posts, synthesize podcast audio, and render .WebM videos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("sources")}
            className="cursor-pointer text-xs h-9 gap-1.5"
          >
            <IconFolders className="size-4" />
            Ingest Sources ({sources.length})
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab("pitch")}
            className="cursor-pointer text-xs h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <IconSparkles className="size-4" />
            Pitch Editorial Angles
          </Button>
        </div>
      </div>

      {/* Real Workspace Metrics */}
      <PipelineStats />

      {/* History Chart & Workflow Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <InteractiveChart />
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm font-semibold tracking-tight text-foreground px-1">
            Workflow Stages
          </div>

          <Card
            className="cursor-pointer border-border hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("sources")}
          >
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconFolders className="size-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground">1. Ingest Sources</div>
                  <div className="text-[11px] text-muted-foreground">Upload media, files, URLs & search</div>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {sources.length}
              </span>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-border hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("pitch")}
          >
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconSparkles className="size-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground">2. Pitch Angles</div>
                  <div className="text-[11px] text-muted-foreground">Extract highlights & editorial angles</div>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {pitchState?.pitches.length || 0}
              </span>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-border hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("blog")}
          >
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconFileText className="size-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground">3. Blog Composer</div>
                  <div className="text-[11px] text-muted-foreground">Generate & edit long-form posts</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                Open <IconPlus className="size-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("podcast")}
              className="cursor-pointer text-xs h-9 justify-start gap-2"
            >
              <IconHeadphones className="size-4 text-primary" />
              <span>Podcast Studio</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("video")}
              className="cursor-pointer text-xs h-9 justify-start gap-2"
            >
              <IconVideo className="size-4 text-primary" />
              <span>Video Studio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Generations Table */}
      <RecentGenerationsTable />
    </div>
  );
}
