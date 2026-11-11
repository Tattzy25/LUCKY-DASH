import { useState } from "react";
import {
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconRefresh,
  IconEye,
  IconEdit,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlogPreview } from "@/features/blog/BlogPreview";
import { BlogEditor } from "@/features/blog/BlogEditor";
import { BlogOutline } from "@/features/blog/BlogOutline";
import { BlogMetaCard } from "@/features/blog/BlogMetaCard";
import { useContent } from "@/context/ContentContext";

export function BlogView() {
  const {
    blogPosts,
    activeBlogPost,
    setActiveBlogPost,
    saveBlogPost,
    generateBlog,
    isGeneratingBlog,
    generatePodcast,
    isGeneratingPodcast,
    generateVideo,
    isGeneratingVideo,
    setActiveTab,
    sources,
  } = useContent();

  const [activeTabMode, setActiveTabMode] = useState<string>("preview");

  if (!activeBlogPost) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center space-y-3">
        <IconFileText className="size-12 text-muted-foreground/50" />
        <h3 className="text-base font-semibold">No active blog post</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Select or compose a new enterprise blog article from your formulated pitch angles.
        </p>
        <Button onClick={() => generateBlog()} className="text-xs h-8">
          Compose Blog Post Now
        </Button>
      </div>
    );
  }

  const handleUpdate = (updated: any) => {
    saveBlogPost({ ...activeBlogPost, ...updated });
  };

  const handleCreatePodcast = async () => {
    setActiveTab("podcast");
    generatePodcast(activeBlogPost);
  };

  const handleCreateVideo = async () => {
    setActiveTab("video");
    generateVideo(activeBlogPost);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconFileText className="size-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate max-w-xl">
              {activeBlogPost.title}
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {activeBlogPost.readingTime}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Canonical publication synthesized from {activeBlogPost.sourceIds?.length || 0} multi-modal sources
          </p>
        </div>

        {/* Repurposing Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreatePodcast}
            disabled={isGeneratingPodcast}
            className="text-xs h-9 gap-1.5 cursor-pointer font-medium border-primary/40 text-primary hover:bg-primary/10"
          >
            <IconHeadphones className="size-3.5" />
            <span>Generate Podcast Audio</span>
            <IconArrowRight className="size-3 ml-0.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateVideo}
            disabled={isGeneratingVideo}
            className="text-xs h-9 gap-1.5 cursor-pointer font-medium border-accent-foreground/40 text-accent-foreground hover:bg-accent/40"
          >
            <IconVideo className="size-3.5" />
            <span>Generate Video Storyboard</span>
            <IconArrowRight className="size-3 ml-0.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateBlog()}
            disabled={isGeneratingBlog}
            className="text-xs h-9 gap-1.5 cursor-pointer"
            title="Re-synthesize with Gemini"
          >
            <IconRefresh className={`size-3.5 ${isGeneratingBlog ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Outline and SEO Metadata */}
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          {blogPosts.length > 1 && (
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Switch Article
              </div>
              <div className="space-y-1">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setActiveBlogPost(post)}
                    className={`cursor-pointer rounded p-2 text-xs transition-colors truncate ${
                      post.id === activeBlogPost.id
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {post.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          <BlogOutline content={activeBlogPost.content} />
          <BlogMetaCard post={activeBlogPost} onUpdate={handleUpdate} />
        </div>

        {/* Right Column: Preview / Editor Tabs */}
        <div className="lg:col-span-8 space-y-3 order-1 lg:order-2">
          <Tabs value={activeTabMode} onValueChange={setActiveTabMode} className="w-full">
            <div className="flex items-center justify-between pb-2">
              <TabsList className="h-8">
                <TabsTrigger value="preview" className="text-xs gap-1.5 cursor-pointer">
                  <IconEye className="size-3.5" />
                  Formatted Publication
                </TabsTrigger>
                <TabsTrigger value="editor" className="text-xs gap-1.5 cursor-pointer">
                  <IconEdit className="size-3.5" />
                  Markdown Editor
                </TabsTrigger>
              </TabsList>

              <Badge variant="secondary" className="text-[10px] font-mono">
                {activeBlogPost.content.split(/\s+/).filter(Boolean).length} Words
              </Badge>
            </div>

            <TabsContent value="preview" className="mt-0">
              <BlogPreview post={activeBlogPost} sources={sources} />
            </TabsContent>

            <TabsContent value="editor" className="mt-0">
              <BlogEditor post={activeBlogPost} onChange={handleUpdate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
