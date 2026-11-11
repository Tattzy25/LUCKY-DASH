import {
  IconBold,
  IconH2,
  IconH3,
  IconQuote,
  IconTable,
  IconList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/types/content";

interface BlogEditorProps {
  post: BlogPost;
  onChange: (updated: Partial<BlogPost>) => void;
}

export function BlogEditor({ post, onChange }: BlogEditorProps) {
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = post.content;
    const selectedText = text.substring(start, end) || "Text";
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    onChange({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("## ")}
            className="h-7 px-2 text-xs"
            title="Heading 2"
          >
            <IconH2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("### ")}
            className="h-7 px-2 text-xs"
            title="Heading 3"
          >
            <IconH3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("**", "**")}
            className="h-7 px-2 text-xs"
            title="Bold"
          >
            <IconBold className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("> ")}
            className="h-7 px-2 text-xs"
            title="Quote Callout"
          >
            <IconQuote className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("- ")}
            className="h-7 px-2 text-xs"
            title="Bullet List"
          >
            <IconList className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Data A | Data B |\n")}
            className="h-7 px-2 text-xs"
            title="Markdown Table"
          >
            <IconTable className="size-4" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Markdown Mode
        </span>
      </div>

      <Textarea
        id="blog-content-editor"
        value={post.content}
        onChange={(e) => onChange({ content: e.target.value })}
        rows={26}
        className="font-mono text-xs leading-relaxed resize-y bg-background"
        placeholder="Write or edit enterprise blog post markdown..."
      />
    </div>
  );
}
