"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Markdown({ children, className, ...props }: MarkdownProps) {
  const content = typeof children === "string" ? children : "";

  // Helper to parse blocks of markdown: code fences and text paragraphs
  const renderFormatted = (text: string) => {
    if (!text) return null;

    // Split on code fences: ```lang\ncode\n```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).replace(/^\n+|\n+$/g, "").split("\n");
        const firstLine = lines[0]?.trim();
        const hasLang = firstLine && !firstLine.includes(" ");
        const language = hasLang ? firstLine : "bash";
        const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={index} className="my-3">
            <CodeBlock size="sm">
              <CodeBlockHeader>
                <CodeBlockTitle>{language}</CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton value={code} />
                </CodeBlockActions>
              </CodeBlockHeader>
              <CodeBlockContent wrap lineNumbers>
                {code}
              </CodeBlockContent>
            </CodeBlock>
          </div>
        );
      }

      // Format text paragraphs, bold, inline code, links
      const paragraphs = part.split(/\n\n+/);
      return (
        <div key={index} className="space-y-2">
          {paragraphs.map((p, pIdx) => {
            if (!p.trim()) return null;
            return (
              <p key={pIdx} className="leading-relaxed">
                {renderInline(p)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for inline styles: **bold**, `code`, *italic*
  const renderInline = (str: string) => {
    const inlineParts = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return inlineParts.map((item, idx) => {
      if (item.startsWith("`") && item.endsWith("`")) {
        return (
          <code
            key={idx}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-foreground"
          >
            {item.slice(1, -1)}
          </code>
        );
      }
      if (item.startsWith("**") && item.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-foreground">
            {item.slice(2, -2)}
          </strong>
        );
      }
      if (item.startsWith("*") && item.endsWith("*")) {
        return (
          <em key={idx} className="italic text-foreground">
            {item.slice(1, -1)}
          </em>
        );
      }
      return item;
    });
  };

  return (
    <div
      data-slot="markdown"
      className={cn(
        "w-full min-w-0 text-sm leading-relaxed wrap-break-word select-text",
        className,
      )}
      {...props}
    >
      {renderFormatted(content)}
    </div>
  );
}
