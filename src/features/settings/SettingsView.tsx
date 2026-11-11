import { useState } from "react";
import {
  IconSettings,
  IconShieldCheck,
  IconSparkles,
  IconCheck,
  IconPlugConnected,
  IconKey,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/context/ContentContext";

export function SettingsView() {
  const { settings, updateSettings } = useContent();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-4xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconSettings className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Enterprise System Configuration
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              Production
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure enterprise brand voice, editorial strictness levels, and automated repurposing triggers
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Brand Voice & Tone */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <IconSparkles className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Brand Voice & Editorial Philosophy</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Controls the tone, terminology, and stylistic constraints applied during blog, podcast, and video synthesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Brand Voice Description</Label>
              <Textarea
                value={settings.brandVoice}
                onChange={(e) => updateSettings({ brandVoice: e.target.value })}
                rows={3}
                className="text-xs resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Injected into system instructions for Gemini API generation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Target Executive Audience</Label>
                <Input
                  value={settings.targetAudience}
                  onChange={(e) => updateSettings({ targetAudience: e.target.value })}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Default Taxonomy Category</Label>
                <Input
                  value={settings.defaultCategory}
                  onChange={(e) => updateSettings({ defaultCategory: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model & Guardrail Controls */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Model Parameters & Topic Guardrails</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Underlying foundation model and boundary constraints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Primary Foundation Model</Label>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(val) => updateSettings({ defaultModel: val })}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended)</SelectItem>
                    <SelectItem value="gemini-flash-latest">Gemini Flash Latest</SelectItem>
                    <SelectItem value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Strictness Guardrail</Label>
                <Select
                  value={settings.strictnessLevel}
                  onValueChange={(val: any) => updateSettings({ strictnessLevel: val })}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (Grounding Only)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="exploratory">Exploratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <div className="text-xs font-semibold text-foreground">Automated Repurposing Pipelines</div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-foreground">Auto-Draft Podcast Audio Script</div>
                  <div className="text-[11px] text-muted-foreground">Automatically prepare dual-speaker script whenever a blog post is drafted</div>
                </div>
                <Switch
                  checked={settings.autoRepurposeToPodcast}
                  onCheckedChange={(checked) => updateSettings({ autoRepurposeToPodcast: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-foreground">Auto-Generate Video Storyboard</div>
                  <div className="text-[11px] text-muted-foreground">Automatically segment scenes and visual prompts after blog completion</div>
                </div>
                <Switch
                  checked={settings.autoRepurposeToVideo}
                  onCheckedChange={(checked) => updateSettings({ autoRepurposeToVideo: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Credentials Information */}
        <Card className="border-border bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
              <IconKey className="size-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-foreground">Gemini API Key Attached Server-Side</div>
              <p className="text-muted-foreground leading-relaxed">
                Your API key is automatically provisioned and managed securely in the backend environment. You can review or configure your API key anytime in the <strong>Settings &gt; Secrets</strong> panel.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <IconCheck className="size-3.5" />
              Settings Saved
            </span>
          )}
          <Button type="submit" size="sm" className="h-9 px-4 text-xs font-medium cursor-pointer">
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
