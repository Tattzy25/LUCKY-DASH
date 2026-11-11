import { useState } from "react";
import { IconWorld, IconSparkles, IconLoader, IconCheck } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/context/ContentContext";

export function UrlIngestCard() {
  const { addSource } = useContent();
  const [url, setUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [urlResult, setUrlResult] = useState<any>(null);
  const [added, setAdded] = useState(false);

  const handleIngestUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsIngesting(true);
    setUrlResult(null);
    setAdded(false);

    try {
      const res = await fetch("/api/sources/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) throw new Error("URL ingestion failed");
      const data = await res.json();
      setUrlResult(data);
    } catch (err) {
      console.error("Error ingesting URL:", err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAddAsSource = () => {
    if (!urlResult) return;

    addSource({
      type: "web_url",
      title: urlResult.title || `Article from ${url}`,
      sourceUrl: url.trim(),
      summary: urlResult.summary,
      highlights: urlResult.keyHighlights || [],
      tags: ["Target URL", "Web Ingestion"],
      rawContent: urlResult.rawExcerpt || urlResult.summary,
    });

    setAdded(true);
    setTimeout(() => {
      setUrlResult(null);
      setUrl("");
      setAdded(false);
    }, 1500);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <IconWorld className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Specific URL Content Scraper</CardTitle>
            <CardDescription className="text-xs">
              Ingest a specific enterprise whitepaper, blog post, or article URL
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleIngestUrl} className="flex gap-2">
          <Input
            placeholder="https://techcrunch.com/article... or https://arxiv.org/abs/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-xs h-9 bg-background"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isIngesting || !url.trim()}
            className="h-9 px-3 text-xs shrink-0 cursor-pointer"
          >
            {isIngesting ? (
              <>
                <IconLoader className="size-3.5 animate-spin mr-1" />
                Scraping...
              </>
            ) : (
              <>
                <IconSparkles className="size-3.5 mr-1 text-primary-foreground" />
                Ingest URL
              </>
            )}
          </Button>
        </form>

        {urlResult && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate max-w-[280px]">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Parsed URL
                </Badge>
                {urlResult.title}
              </span>
              <Button
                size="sm"
                variant={added ? "default" : "secondary"}
                onClick={handleAddAsSource}
                disabled={added}
                className="text-xs h-7 px-2.5 cursor-pointer"
              >
                {added ? (
                  <>
                    <IconCheck className="size-3.5 mr-1" />
                    Added
                  </>
                ) : (
                  "+ Ingest into Sources"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {urlResult.summary}
            </p>

            {urlResult.keyHighlights?.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-foreground">Extracted Highlights:</div>
                <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                  {urlResult.keyHighlights.slice(0, 3).map((h: string, idx: number) => (
                    <li key={idx} className="line-clamp-1">{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
