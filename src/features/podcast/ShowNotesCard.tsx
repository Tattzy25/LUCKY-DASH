import { useState } from "react";
import { IconDownload, IconCopy, IconCheck, IconBookmark, IconClock } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PodcastEpisode } from "@/types/content";

interface ShowNotesCardProps {
  episode: PodcastEpisode;
}

export function ShowNotesCard({ episode }: ShowNotesCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyNotes = () => {
    const text = `# ${episode.episodeTitle}\n\n${episode.tagline}\n\n## Chapters\n${episode.chapters.map((c) => `- ${c.timestamp} ${c.title}`).join("\n")}\n\n## Key Takeaways\n${episode.showNotes.map((n) => `- ${n}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const text = `# ${episode.episodeTitle}\n\n` + episode.dialogue.map((d) => `[${d.speaker} (${d.role})]:\n${d.text}\n`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `podcast-${episode.episodeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Chapter Markers */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold">Episode Chapters & Timestamps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {episode.chapters.map((ch, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs rounded border border-border/70 p-2 bg-muted/20 hover:bg-muted/40 cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <IconBookmark className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-foreground truncate">{ch.title}</span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                <IconClock className="size-2.5 mr-1" />
                {ch.timestamp}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Show Notes & Key Takeaways */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold">Executive Show Notes & Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          <ul className="space-y-1.5">
            {episode.showNotes.map((note, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                <span className="text-primary font-bold">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-border flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyNotes}
              className="text-xs h-8 w-full justify-start cursor-pointer"
            >
              {copied ? (
                <>
                  <IconCheck className="size-3.5 mr-1.5 text-primary" />
                  Copied Show Notes
                </>
              ) : (
                <>
                  <IconCopy className="size-3.5 mr-1.5" />
                  Copy Show Notes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTranscript}
              className="text-xs h-8 w-full justify-start cursor-pointer"
            >
              <IconDownload className="size-3.5 mr-1.5" />
              Download Script (.TXT)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
