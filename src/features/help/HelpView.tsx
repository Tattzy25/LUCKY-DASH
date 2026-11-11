import { IconHelp, IconFolders, IconSparkles, IconFileText, IconHeadphones, IconVideo } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HelpView() {
  const steps = [
    {
      title: "1. Multi-Source Ingestion",
      icon: IconFolders,
      desc: "Provide video links or files, audio recordings, PDF/DOCX whitepapers, or execute live grounded Google Web search queries. The engine extracts transcripts, timestamps, and core statistical highlights.",
    },
    {
      title: "2. Pitch Angles & Highlight Clustering",
      icon: IconSparkles,
      desc: "The system combines all inputs, eliminates noise, and groups insights into categorical taxonomy pillars. It formulates 3 distinct editorial angles (Strategic, Technical, Pragmatic) with strict topic boundaries.",
    },
    {
      title: "3. Complete Blog Post Composition",
      icon: IconFileText,
      desc: "Drafts publication-ready long-form copy with inline source citations, executive summaries, data comparison tables, and SEO meta tags.",
    },
    {
      title: "4. Conversational Podcast Synthesis",
      icon: IconHeadphones,
      desc: "Automatically adapts the blog post into an interactive dual-speaker podcast script with realistic voice synthesis, chapter timestamps, and show notes.",
    },
    {
      title: "5. Scene-by-Scene Video Storyboarding",
      icon: IconVideo,
      desc: "Generates visual scene cards with AI visual generation prompts, on-screen lower third graphics, and voiceover audio.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconHelp className="size-4" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            OmniContent Workflow Guide
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Architecture and best practices for enterprise multi-source synthesis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={idx} className="border-border">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
