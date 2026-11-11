import {
  IconPlugConnected,
  IconCheck,
  IconWorld,
  IconBroadcast,
  IconBrandYoutube,
  IconCloud,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ConnectionsView() {
  const integrations = [
    {
      name: "Enterprise Headless CMS",
      type: "Publishing Target",
      icon: IconWorld,
      status: "Connected",
      desc: "Direct webhook and REST push to WordPress VIP, Webflow, Ghost, or Contentful.",
    },
    {
      name: "Podcast Syndication Feed (RSS / Apple / Spotify)",
      type: "Audio Distribution",
      icon: IconBroadcast,
      status: "Configured",
      desc: "Automated XML generation with chapter markers and audio enclosures.",
    },
    {
      name: "Video Asset Storage & YouTube API",
      type: "Video Publishing",
      icon: IconBrandYoutube,
      status: "Ready",
      desc: "Direct storyboard export, SRT subtitle upload, and keyframe rendering.",
    },
    {
      name: "Cloud Media Storage (S3 / Cloud Storage)",
      type: "Source Storage",
      icon: IconCloud,
      status: "Active",
      desc: "Encrypted object store for raw webinars, MP3 recordings, and PDF whitepapers.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconPlugConnected className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Integrations & Publishing Targets
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect your enterprise distribution endpoints and content repositories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="border-border">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      <IconCheck className="size-3 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono">{item.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-8 cursor-pointer">
                  Configure Endpoint
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
