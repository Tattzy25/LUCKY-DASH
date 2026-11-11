import { useState } from "react";
import { IconCategory, IconCheck, IconPlus, IconSparkles } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PitchCategory } from "@/types/content";

interface HighlightsClusterProps {
  categories: PitchCategory[];
  curatedHighlights: string[];
}

export function HighlightsCluster({ categories, curatedHighlights }: HighlightsClusterProps) {
  const [customHighlight, setCustomHighlight] = useState("");
  const [highlights, setHighlights] = useState<string[]>(curatedHighlights);

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHighlight.trim()) return;
    setHighlights((prev) => [customHighlight.trim(), ...prev]);
    setCustomHighlight("");
  };

  return (
    <div className="space-y-4">
      {/* Curated Highlights across all sources */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <IconSparkles className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  Synthesized Source Highlights ({highlights.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Unified key findings extracted and de-duplicated across all video, audio, files, and web search
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              Ground Truth
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-muted/20 p-2.5 text-xs text-foreground"
              >
                <IconCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{highlight}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddHighlight} className="flex gap-2 pt-1">
            <Input
              placeholder="Add proprietary enterprise metric or key quote..."
              value={customHighlight}
              onChange={(e) => setCustomHighlight(e.target.value)}
              className="text-xs h-8"
            />
            <Button type="submit" size="sm" variant="outline" className="text-xs h-8 shrink-0">
              <IconPlus className="size-3.5 mr-1" />
              Add Fact
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categorical Taxonomy Clusters */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconCategory className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                Categorical Taxonomy Clustering
              </CardTitle>
              <CardDescription className="text-xs">
                Extracted information organized into logical editorial pillars to ensure comprehensive topic coverage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-3 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-foreground">
                      {cat.name}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      Pillar {idx + 1}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {cat.points.map((point, pIdx) => (
                      <li key={pIdx} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-snug">
                        <span className="text-primary font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
