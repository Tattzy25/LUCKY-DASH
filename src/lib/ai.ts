// Compatibility bridge for AI chat helpers
// Re-exports createChat from @shadcn/helpers/ai-sdk and provides getMessageText
import type { UIMessage } from "ai";
export * from "@shadcn/helpers/ai-sdk";

export function getMessageText(message: Pick<UIMessage, "parts"> | any): string {
  if (!message) return "";
  if (typeof message === "string") return message;
  if (Array.isArray(message.parts)) {
    return message.parts.reduce(
      (text: string, part: any) =>
        part && part.type === "text" && typeof part.text === "string"
          ? text + part.text
          : text,
      ""
    );
  }
  if (typeof message.content === "string") return message.content;
  if (typeof message.text === "string") return message.text;
  return "";
}
