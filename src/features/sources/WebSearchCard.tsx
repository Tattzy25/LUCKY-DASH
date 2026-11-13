import { useState } from "react";
import { IconSearch, IconSparkles, IconLoader, IconCheck, IconLink } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";

export function WebSearchCard() {
  const { addSource } = useContent();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [added, setAdded] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setAdded(false);

    try {
      const res = await fetch("/api/sources/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search grounding failed");
      setSearchResult(data);
    } catch (err: any) {
      console.error("Error searching web:", err);
      toast.error(err?.message || "Web search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAsSource = () => {
    if (!searchResult) return;

    addSource({
      type: "web_search",
      title: `Grounded Search: ${query}`,
      sourceUrl: `https://google.com/search?q=${encodeURIComponent(query)}`,
      summary: searchResult.summary,
      highlights: searchResult.extractedHighlights || [],
      tags: ["Grounded Web", "Search Index"],
      groundingUrls: (searchResult.groundingChunks || []).map((c: any) => ({
        title: c.web?.title || "Search Result",
        uri: c.web?.uri || "#",
      })),
      rawContent: searchResult.summary,
    });

    setAdded(true);
    setTimeout(() => {
      setSearchResult(null);
      setQuery("");
      setAdded(false);
    }, 1200);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconSearch className="size-4 text-primary" />
          <div>
            <CardTitle className="text-sm font-semibold">Live Web Search Grounding</CardTitle>
            <CardDescription className="text-xs">
              Execute topic research using live Google Search grounding
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="e.g. B2B SaaS churn benchmarks 2026..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs h-9 bg-background"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isSearching || !query.trim()}
            className="h-9 px-3 text-xs shrink-0 cursor-pointer"
          >
            {isSearching ? (
              <>
                <IconLoader className="size-3.5 animate-spin mr-1" />
                Searching...
              </>
            ) : (
              <>
                <IconSparkles className="size-3.5 mr-1" />
                Search Web
              </>
            )}
          </Button>
        </form>

        {searchResult && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Grounded Results
                </Badge>
                {searchResult.groundingChunks?.length || 0} citations
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
                  "+ Add to Sources"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {searchResult.summary}
            </p>

            {searchResult.extractedHighlights?.length > 0 && (
              <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                {searchResult.extractedHighlights.slice(0, 3).map((h: string, idx: number) => (
                  <li key={idx} className="line-clamp-1">{h}</li>
                ))}
              </ul>
            )}

            {searchResult.groundingChunks?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {searchResult.groundingChunks.slice(0, 3).map((chunk: any, idx: number) => (
                  <a
                    key={idx}
                    href={chunk.web?.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] bg-background border border-border rounded px-2 py-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <IconLink className="size-2.5" />
                    <span className="max-w-[160px] truncate">{chunk.web?.title || "Source"}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
