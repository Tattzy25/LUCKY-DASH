import { useState } from "react";
import {
  IconPlugConnected,
  IconSend,
  IconDownload,
  IconCheck,
  IconLoader,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";

export function ConnectionsView() {
  const { settings, updateSettings, blogPosts, activeBlogPost } = useContent();
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || "");
  const [selectedPostId, setSelectedPostId] = useState(activeBlogPost?.id || blogPosts[0]?.id || "");
  const [isSending, setIsSending] = useState(false);
  const [savedUrl, setSavedUrl] = useState(false);

  const selectedPost = blogPosts.find((b) => b.id === selectedPostId) || activeBlogPost || blogPosts[0];

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ webhookUrl: webhookUrl.trim() });
    setSavedUrl(true);
    toast.success("Webhook endpoint saved.");
    setTimeout(() => setSavedUrl(false), 2000);
  };

  const handlePublishWebhook = async () => {
    const targetUrl = webhookUrl.trim() || settings.webhookUrl?.trim();
    if (!targetUrl) {
      toast.error("Enter a valid https:// webhook URL first.");
      return;
    }
    if (!selectedPost) {
      toast.error("Generate or select a blog post to publish.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/publish/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: targetUrl,
          payload: {
            title: selectedPost.title,
            slug: selectedPost.slug,
            metaDescription: selectedPost.metaDescription,
            keywords: selectedPost.keywords,
            category: selectedPost.category,
            contentMarkdown: selectedPost.content,
            publishedAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast.success(`Published to webhook (HTTP ${data.status}).`);
    } catch (err: any) {
      toast.error(err?.message || "Webhook delivery failed.");
    } finally {
      setIsSending(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!selectedPost) {
      toast.error("No blog post available to export.");
      return;
    }
    const frontmatter = [
      "---",
      `title: "${selectedPost.title.replace(/"/g, '\\"')}"`,
      `slug: "${selectedPost.slug}"`,
      `description: "${selectedPost.metaDescription.replace(/"/g, '\\"')}"`,
      `date: "${selectedPost.createdAt}"`,
      `keywords: [${selectedPost.keywords.map((k) => `"${k}"`).join(", ")}]`,
      "---",
      "",
      selectedPost.content,
    ].join("\n");

    const blob = new Blob([frontmatter], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPost.slug || "post"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <IconPlugConnected className="size-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Publishing & Export Endpoints
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Push generated content to any CMS webhook or export clean Markdown with frontmatter
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Webhook CMS Publisher</CardTitle>
          <CardDescription className="text-xs">
            Sends a real JSON POST payload (title, slug, metaDescription, keywords, contentMarkdown) to your endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveWebhook} className="space-y-2">
            <Label className="text-xs">Destination Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://your-cms.example.com/webhooks/publish"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="text-xs h-9"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9 text-xs shrink-0 cursor-pointer">
                {savedUrl ? (
                  <>
                    <IconCheck className="size-3.5 mr-1" />
                    Saved
                  </>
                ) : (
                  "Save URL"
                )}
              </Button>
            </div>
          </form>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-xs">Select Article to Publish or Export</Label>
            {blogPosts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No blog posts created yet. Draft a post in Blog Studio first.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedPost?.id || ""} onValueChange={setSelectedPostId}>
                  <SelectTrigger className="h-9 text-xs flex-1">
                    <SelectValue placeholder="Choose a blog post" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogPosts.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  size="sm"
                  onClick={handlePublishWebhook}
                  disabled={isSending || !selectedPost}
                  className="h-9 text-xs cursor-pointer"
                >
                  {isSending ? (
                    <IconLoader className="size-3.5 mr-1 animate-spin" />
                  ) : (
                    <IconSend className="size-3.5 mr-1" />
                  )}
                  Send to Webhook
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportMarkdown}
                  disabled={!selectedPost}
                  className="h-9 text-xs cursor-pointer"
                >
                  <IconDownload className="size-3.5 mr-1" />
                  Download .MD
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
