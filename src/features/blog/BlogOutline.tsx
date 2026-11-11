import { IconListTree, IconBookmark } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogOutlineProps {
  content: string;
}

export function BlogOutline({ content }: BlogOutlineProps) {
  // Extract headings (H2 and H3)
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const isH3 = line.startsWith("### ");
      const title = line.replace(/^#{2,3}\s+/, "").trim();
      return { title, isH3 };
    });

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconListTree className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold">Document Outline</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {wordCount} words
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {headings.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No section headings detected</p>
        ) : (
          headings.map((h, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer truncate ${
                h.isH3 ? "pl-4 text-[11px]" : "font-medium"
              }`}
            >
              <IconBookmark className="size-3 text-primary/70 shrink-0" />
              <span className="truncate">{h.title}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
