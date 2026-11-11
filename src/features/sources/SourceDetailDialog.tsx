import {
  IconVideo,
  IconHeadphones,
  IconFileText,
  IconWorld,
  IconLink,
  IconCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { SourceItem } from "@/types/content";

interface SourceDetailDialogProps {
  source: SourceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceDetailDialog({
  source,
  open,
  onOpenChange,
}: SourceDetailDialogProps) {
  if (!source) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <IconVideo className="size-5 text-primary" />;
      case "audio":
        return <IconHeadphones className="size-5 text-primary" />;
      case "file":
        return <IconFileText className="size-5 text-primary" />;
      default:
        return <IconWorld className="size-5 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              {getSourceIcon(source.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {source.type.replace("_", " ")}
                </Badge>
                {source.duration && (
                  <span className="text-xs text-muted-foreground font-mono">
                    Duration: {source.duration}
                  </span>
                )}
                {source.fileSize && (
                  <span className="text-xs text-muted-foreground font-mono">
                    Size: {source.fileSize}
                  </span>
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold mt-1 text-foreground">
                {source.title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingested on {source.dateAdded} • {source.selectedForPitch ? "Selected for pitch & synthesis" : "Archived source"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Executive Summary */}
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Executive Summary
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              {source.summary}
            </p>
          </div>

          {/* Key Extracted Highlights */}
          {source.highlights && source.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Editorial Highlights ({source.highlights.length})
              </h4>
              <div className="space-y-1.5">
                {source.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 p-2 text-xs"
                  >
                    <IconCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Excerpt or Transcript */}
          {source.rawContent && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Text Excerpt / Transcription Log
              </h4>
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {source.rawContent}
              </div>
            </div>
          )}

          {/* Grounding URLs if any */}
          {source.groundingUrls && source.groundingUrls.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verified Search Citations
              </h4>
              <div className="flex flex-col gap-1">
                {source.groundingUrls.map((g, i) => (
                  <a
                    key={i}
                    href={g.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <IconLink className="size-3.5 shrink-0" />
                    <span className="truncate">{g.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <Separator />
          <div className="flex flex-wrap gap-1.5">
            {source.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
