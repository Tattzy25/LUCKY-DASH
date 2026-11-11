import {
  IconFileText,
  IconClock,
  IconUser,
  IconCalendar,
  IconBookmark,
  IconLink,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BlogPost, SourceItem } from "@/types/content";

interface BlogPreviewProps {
  post: BlogPost;
  sources: SourceItem[];
}

export function BlogPreview({ post, sources }: BlogPreviewProps) {
  // Simple markdown renderer for clean enterprise typography without bulky external markdown deps
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0].split("|").filter((c) => c.trim().length > 0);
        const dataRows = tableRows.slice(2); // Skip separator

        elements.push(
          <div key={`table-${elements.length}`} className="my-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {headerRow.map((h, i) => (
                    <th key={i} className="p-2.5 font-semibold text-foreground">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dataRows.map((r, rIdx) => {
                  const cells = r.split("|").filter((c) => c.trim().length > 0);
                  return (
                    <tr key={rIdx} className="hover:bg-muted/20">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-muted-foreground">
                          {cell.trim().replace(/\*\*(.*?)\*\*/g, "$1")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, idx) => {
      // Table lines
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        inTable = true;
        tableRows.push(line.trim());
        return;
      } else if (inTable) {
        flushTable();
      }

      // H1 Header (Skip if already handled in banner)
      if (line.startsWith("# ")) {
        return;
      }

      // H2 Header
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={idx}
            className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-8 mb-3 pb-1 border-b border-border/60 flex items-center gap-2"
          >
            <IconBookmark className="size-4 text-primary shrink-0" />
            <span>{line.replace("## ", "")}</span>
          </h2>
        );
        return;
      }

      // H3 Header
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={idx}
            className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2"
          >
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        elements.push(
          <div
            key={idx}
            className="my-4 rounded-r-lg border-l-4 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground/90 italic leading-relaxed"
          >
            {line.replace("> ", "").replace(/\*\*(.*?)\*\*/g, "$1")}
          </div>
        );
        return;
      }

      // Divider
      if (line.trim() === "---") {
        elements.push(<Separator key={idx} className="my-6" />);
        return;
      }

      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().replace(/^[-*]\s+/, "");
        elements.push(
          <li key={idx} className="text-xs sm:text-sm text-foreground/85 leading-relaxed ml-4 list-disc my-1">
            {itemText.split("**").map((part, pIdx) =>
              pIdx % 2 === 1 ? <strong key={pIdx} className="text-foreground">{part}</strong> : part
            )}
          </li>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        return;
      }

      // Regular Paragraph
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-foreground/90 leading-relaxed my-3 font-normal">
          {line.split("**").map((part, pIdx) =>
            pIdx % 2 === 1 ? <strong key={pIdx} className="text-foreground font-semibold">{part}</strong> : part
          )}
        </p>
      );
    });

    if (inTable) flushTable();
    return elements;
  };

  const citedSources = sources.filter((s) => post.sourceIds.includes(s.id));

  return (
    <article className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Article Header Meta */}
      <div className="space-y-3 pb-5 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-xs font-medium">
            {post.category || "Enterprise Research"}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <IconClock className="size-3.5" />
            <span>{post.readingTime}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <IconCalendar className="size-3.5" />
            <span>{post.createdAt}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconUser className="size-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground">{post.author}</span>
              <span className="text-muted-foreground"> • Chief Editorial Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Ingested Source Attribution Bar */}
      {citedSources.length > 0 && (
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IconLink className="size-3 text-primary" />
            <span>Grounded Ingested Sources ({citedSources.length}):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {citedSources.map((source) => (
              <Badge key={source.id} variant="secondary" className="text-[10px] gap-1">
                <IconFileText className="size-2.5 text-primary" />
                <span className="truncate max-w-[200px]">{source.title}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Rendered Prose Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {renderMarkdown(post.content)}
      </div>
    </article>
  );
}
