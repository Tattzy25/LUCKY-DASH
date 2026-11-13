import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { IconChartBar } from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useContent } from "@/context/ContentContext";

const chartConfig = {
  wordsSynthesized: {
    label: "Words Synthesized",
    color: "var(--primary)",
  },
  assetsCreated: {
    label: "Assets Created",
    color: "var(--accent-foreground)",
  },
} satisfies ChartConfig;

export function InteractiveChart() {
  const { sources, blogPosts, podcastEpisodes, videoStoryboards } = useContent();
  const [timeRange, setTimeRange] = React.useState("30d");

  const chartData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const today = new Date();
    const byDate = new Map<string, { wordsSynthesized: number; assetsCreated: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      byDate.set(iso, { wordsSynthesized: 0, assetsCreated: 0 });
    }

    for (const s of sources) {
      const bucket = byDate.get(s.dateAdded);
      if (bucket) {
        bucket.assetsCreated += 1;
        bucket.wordsSynthesized += (s.rawContent || s.summary || "").split(/\s+/).filter(Boolean).length;
      }
    }
    for (const b of blogPosts) {
      const bucket = byDate.get(b.createdAt);
      if (bucket) {
        bucket.assetsCreated += 1;
        bucket.wordsSynthesized += b.content.split(/\s+/).filter(Boolean).length;
      }
    }
    for (const p of podcastEpisodes) {
      const bucket = byDate.get(p.createdAt);
      if (bucket) {
        bucket.assetsCreated += 1;
      }
    }
    for (const v of videoStoryboards) {
      const bucket = byDate.get(v.createdAt);
      if (bucket) {
        bucket.assetsCreated += 1;
      }
    }

    return Array.from(byDate.entries()).map(([date, vals]) => ({
      date,
      ...vals,
    }));
  }, [sources, blogPosts, podcastEpisodes, videoStoryboards, timeRange]);

  const hasActivity = chartData.some((d) => d.wordsSynthesized > 0 || d.assetsCreated > 0);

  return (
    <Card className="@container/card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Workspace Output History
        </CardTitle>
        <CardDescription>
          Real daily word count and asset count across your ingested sources and generated content
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="cursor-pointer text-xs">90 Days</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="cursor-pointer text-xs">30 Days</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="cursor-pointer text-xs">7 Days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-28 @[767px]/card:hidden text-xs" size="sm">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        {!hasActivity ? (
          <Empty className="border min-h-[230px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconChartBar />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No workspace activity yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Ingest a source or generate a post to populate your daily output chart.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[230px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillWords" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) => {
                  const date = new Date(value + "T00:00:00");
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(String(value) + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="wordsSynthesized"
                type="monotone"
                fill="url(#fillWords)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
