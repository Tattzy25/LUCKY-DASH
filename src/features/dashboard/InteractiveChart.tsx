import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
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

const throughputData = [
  { date: "2026-10-01", wordsSynthesized: 12400, sourcesIngested: 85 },
  { date: "2026-10-05", wordsSynthesized: 18200, sourcesIngested: 120 },
  { date: "2026-10-10", wordsSynthesized: 24500, sourcesIngested: 165 },
  { date: "2026-10-15", wordsSynthesized: 21800, sourcesIngested: 140 },
  { date: "2026-10-20", wordsSynthesized: 33400, sourcesIngested: 210 },
  { date: "2026-10-25", wordsSynthesized: 28900, sourcesIngested: 195 },
  { date: "2026-10-30", wordsSynthesized: 41200, sourcesIngested: 260 },
  { date: "2026-11-04", wordsSynthesized: 46800, sourcesIngested: 310 },
  { date: "2026-11-08", wordsSynthesized: 54100, sourcesIngested: 385 },
  { date: "2026-11-11", wordsSynthesized: 62400, sourcesIngested: 420 },
];

const chartConfig = {
  wordsSynthesized: {
    label: "Words Synthesized",
    color: "var(--primary)",
  },
  sourcesIngested: {
    label: "Sources Ingested",
    color: "var(--accent-foreground)",
  },
} satisfies ChartConfig;

export function InteractiveChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  return (
    <Card className="@container/card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Multi-Source Throughput & Editorial Velocity
        </CardTitle>
        <CardDescription>
          Tracking cumulative words synthesized and multi-modal sources processed across enterprise pipelines
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="cursor-pointer text-xs">Last Quarter</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="cursor-pointer text-xs">Last 30 Days</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="cursor-pointer text-xs">Last 7 Days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-36 @[767px]/card:hidden text-xs"
              size="sm"
            >
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last Quarter</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[230px] w-full"
        >
          <AreaChart data={throughputData}>
            <defs>
              <linearGradient id="fillWords" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
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
                    new Date(String(value)).toLocaleDateString("en-US", {
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
              type="natural"
              fill="url(#fillWords)"
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
