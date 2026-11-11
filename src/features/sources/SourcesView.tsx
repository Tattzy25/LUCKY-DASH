import { IconSparkles, IconArrowRight, IconFolders } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceUploadCard } from "@/features/sources/SourceUploadCard";
import { WebSearchCard } from "@/features/sources/WebSearchCard";
import { UrlIngestCard } from "@/features/sources/UrlIngestCard";
import { SourcesList } from "@/features/sources/SourcesList";
import { useContent } from "@/context/ContentContext";

export function SourcesView() {
  const { sources, setActiveTab, generatePitch, isGeneratingPitch } = useContent();
  const selectedSourcesCount = sources.filter((s) => s.selectedForPitch).length;

  const handleProceedToPitch = async () => {
    setActiveTab("pitch");
    generatePitch();
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconFolders className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Sources & Research Ingestion Hub
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {sources.length} Ingested
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ingest multimedia inputs—recorded videos, audio podcasts, PDF whitepapers, and live grounded web searches
          </p>
        </div>

        <Button
          onClick={handleProceedToPitch}
          disabled={selectedSourcesCount === 0 || isGeneratingPitch}
          className="text-xs h-9 gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <IconSparkles className="size-3.5" />
          <span>Pitch Angles with {selectedSourcesCount} Sources</span>
          <IconArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>

      {/* Ingestion Modules: Upload + Web Search + URL Ingest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <SourceUploadCard />
        </div>
        <div className="lg:col-span-6 flex flex-col gap-4">
          <WebSearchCard />
          <UrlIngestCard />
        </div>
      </div>

      {/* Active Ingested Sources Library */}
      <SourcesList />
    </div>
  );
}
