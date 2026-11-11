import { useState } from "react";
import { IconCopy, IconCheck, IconDownload, IconShare } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlogPost } from "@/types/content";

interface BlogMetaCardProps {
  post: BlogPost;
  onUpdate: (updated: Partial<BlogPost>) => void;
}

export function BlogMetaCard({ post, onUpdate }: BlogMetaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([post.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${post.slug || "enterprise-post"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold">SEO & Metadata Controls</CardTitle>
          <Badge
            variant={post.status === "published" ? "default" : "secondary"}
            className="capitalize text-[10px]"
          >
            {post.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Publication Status</Label>
          <Select
            value={post.status}
            onValueChange={(val: any) => onUpdate({ status: val })}
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (In Review)</SelectItem>
              <SelectItem value="review">Review Committee Pending</SelectItem>
              <SelectItem value="published">Published Canonical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">URL Slug</Label>
          <Input
            value={post.slug}
            onChange={(e) => onUpdate({ slug: e.target.value })}
            className="text-xs h-8 font-mono text-[11px]"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Meta Description (Search Snippet)</Label>
          <p className="text-xs text-foreground bg-muted/30 border border-border/80 rounded p-2 leading-relaxed">
            {post.metaDescription || "Enterprise multi-source synthesized article."}
          </p>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Keywords</Label>
          <div className="flex flex-wrap gap-1">
            {post.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="text-[9px]">
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="text-xs h-8 w-full justify-start cursor-pointer"
          >
            {copied ? (
              <>
                <IconCheck className="size-3.5 mr-1.5 text-primary" />
                Copied Markdown
              </>
            ) : (
              <>
                <IconCopy className="size-3.5 mr-1.5" />
                Copy Full Markdown
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="text-xs h-8 w-full justify-start cursor-pointer"
          >
            <IconDownload className="size-3.5 mr-1.5" />
            Download .MD File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
