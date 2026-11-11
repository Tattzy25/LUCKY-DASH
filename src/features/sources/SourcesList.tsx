import { useState } from "react";
import {
  IconVideo,
  IconHeadphones,
  IconFileText,
  IconWorld,
  IconSearch,
  IconTrash,
  IconEye,
  IconCheck,
} from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SourceDetailDialog } from "@/features/sources/SourceDetailDialog";
import { useContent } from "@/context/ContentContext";
import type { SourceItem, SourceType } from "@/types/content";

export function SourcesList() {
  const { sources, toggleSelectSource, selectAllSources, removeSource } = useContent();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectSource, setInspectSource] = useState<SourceItem | null>(null);

  const filteredSources = sources.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedCount = sources.filter((s) => s.selectedForPitch).length;
  const allSelected = sources.length > 0 && selectedCount === sources.length;

  const getTypeIcon = (type: SourceType) => {
    switch (type) {
      case "video":
        return <IconVideo className="size-4 text-primary" />;
      case "audio":
        return <IconHeadphones className="size-4 text-primary" />;
      case "file":
        return <IconFileText className="size-4 text-primary" />;
      default:
        return <IconWorld className="size-4 text-primary" />;
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-base font-semibold">
              Ingested Sources Library ({sources.length})
            </CardTitle>
            <Badge variant="default" className="text-xs">
              {selectedCount} Selected for Pitch
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Select which video, audio, files, and web search materials feed into the pitch and blog synthesis engine
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAllSources(!allSelected)}
            className="text-xs h-8 cursor-pointer"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-2.5 cursor-pointer">
                All ({sources.length})
              </TabsTrigger>
              <TabsTrigger value="video" className="text-xs px-2.5 cursor-pointer">
                Video ({sources.filter((s) => s.type === "video").length})
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs px-2.5 cursor-pointer">
                Audio ({sources.filter((s) => s.type === "audio").length})
              </TabsTrigger>
              <TabsTrigger value="file" className="text-xs px-2.5 cursor-pointer">
                Files ({sources.filter((s) => s.type === "file").length})
              </TabsTrigger>
              <TabsTrigger value="web_search" className="text-xs px-2.5 cursor-pointer">
                Web ({sources.filter((s) => s.type === "web_search" || s.type === "web_url").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by keyword or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-8 pl-8"
            />
          </div>
        </div>

        {/* Source Cards List */}
        {filteredSources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-1">
            <p className="text-sm font-medium text-foreground">No matching sources found</p>
            <p className="text-xs text-muted-foreground">
              Ingest a new video, audio interview, document, or web search query above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                  source.selectedForPitch
                    ? "border-primary/40 bg-accent/20"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={source.selectedForPitch}
                      onCheckedChange={() => toggleSelectSource(source.id)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    {getTypeIcon(source.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-md">
                        {source.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {source.type.replace("_", " ")}
                      </Badge>
                      {source.duration && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {source.duration}
                        </span>
                      )}
                      {source.fileSize && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {source.fileSize}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {source.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-primary flex items-center gap-1 font-medium">
                        <IconCheck className="size-3" />
                        {source.highlights?.length || 0} highlights extracted
                      </span>
                      {source.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectSource(source)}
                    className="text-xs h-8 gap-1 cursor-pointer"
                  >
                    <IconEye className="size-3.5" />
                    Inspect
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSource(source.id)}
                    className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SourceDetailDialog
        source={inspectSource}
        open={!!inspectSource}
        onOpenChange={(open) => !open && setInspectSource(null)}
      />
    </Card>
  );
}
