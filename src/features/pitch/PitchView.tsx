import { IconSparkles, IconArrowRight, IconLoader, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AngleCard } from "@/features/pitch/AngleCard";
import { HighlightsCluster } from "@/features/pitch/HighlightsCluster";
import { TopicGuardrailsCard } from "@/features/pitch/TopicGuardrailsCard";
import { useContent } from "@/context/ContentContext";

export function PitchView() {
  const {
    pitchState,
    selectedPitch,
    selectPitch,
    generateBlog,
    isGeneratingBlog,
    setActiveTab,
    isGeneratingPitch,
  } = useContent();

  const handleComposeBlog = async () => {
    setActiveTab("blog");
    generateBlog();
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconSparkles className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Editorial Pitch & Angle Formulation
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {pitchState?.pitches.length || 0} Angles Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Combines all ingested video, audio, files, and web search into tailored editorial angles with strict topic boundaries
          </p>
        </div>

        <Button
          onClick={handleComposeBlog}
          disabled={!selectedPitch || isGeneratingBlog}
          className="text-xs h-9 gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          {isGeneratingBlog ? (
            <>
              <IconLoader className="size-3.5 animate-spin mr-1" />
              Composing Publication...
            </>
          ) : (
            <>
              <IconCheck className="size-3.5" />
              <span>Compose Blog Post with Selected Angle</span>
              <IconArrowRight className="size-3.5 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Editorial Pitch Angles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Editorial Pitch Angle ({pitchState?.pitches.length || 0} Formulated)
          </span>
          <span className="text-xs text-muted-foreground">
            Active: <strong className="text-foreground">{selectedPitch?.title || "None"}</strong>
          </span>
        </div>

        {isGeneratingPitch ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-card animate-pulse p-5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pitchState?.pitches.map((angle) => (
              <AngleCard
                key={angle.id}
                angle={angle}
                isSelected={selectedPitch?.id === angle.id}
                onSelect={() => selectPitch(angle)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Topic Guardrails and Focus Control */}
      <TopicGuardrailsCard guardrails={pitchState?.topicGuardrails || []} />

      {/* Highlights Clustering and Categorical Pillars */}
      <HighlightsCluster
        categories={pitchState?.categories || []}
        curatedHighlights={pitchState?.curatedHighlights || []}
      />
    </div>
  );
}
