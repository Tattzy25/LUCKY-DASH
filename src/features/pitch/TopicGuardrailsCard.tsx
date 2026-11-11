import { useState } from "react";
import { IconShieldCheck, IconAlertTriangle, IconRefresh, IconCheck } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/context/ContentContext";

interface TopicGuardrailsCardProps {
  guardrails: string[];
}

export function TopicGuardrailsCard({ guardrails }: TopicGuardrailsCardProps) {
  const { settings, updateSettings, generatePitch, isGeneratingPitch } = useContent();
  const [topicFocus, setTopicFocus] = useState("Enterprise Multi-Source Content Synthesis");

  const handleRegeneratePitches = () => {
    generatePitch(topicFocus);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Editorial Governance & Topic Guardrails</CardTitle>
              <CardDescription className="text-xs">
                Enforce strict boundary rules to prevent hallucinations, promotional hype, and editorial drift
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Guardrails Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-xs">Primary Focus Topic / Anchor Thesis</Label>
            <div className="flex gap-2">
              <Input
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                placeholder="e.g. Enterprise Multi-Source Content Synthesis"
                className="text-xs h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegeneratePitches}
                disabled={isGeneratingPitch || !topicFocus.trim()}
                className="text-xs h-8 shrink-0 cursor-pointer"
              >
                <IconRefresh className={`size-3.5 mr-1 ${isGeneratingPitch ? "animate-spin" : ""}`} />
                Re-Pitch
              </Button>
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs">Factual Strictness</Label>
            <Select
              value={settings.strictnessLevel}
              onValueChange={(val: any) => updateSettings({ strictnessLevel: val })}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Strictness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict (100% Ingested Sources Only)</SelectItem>
                <SelectItem value="balanced">Balanced (Ingested Sources + Synthesis)</SelectItem>
                <SelectItem value="exploratory">Exploratory (Broad Synthesis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs">Target Audience</Label>
            <Input
              value={settings.targetAudience}
              onChange={(e) => updateSettings({ targetAudience: e.target.value })}
              className="text-xs h-8"
            />
          </div>
        </div>

        {/* Active Guardrail Rules */}
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <IconAlertTriangle className="size-3.5 text-amber-500" />
            <span>Active Boundary Rules:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {guardrails.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <IconCheck className="size-3 text-primary shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
