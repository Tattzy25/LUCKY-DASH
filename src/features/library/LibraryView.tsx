import { useState } from "react";
import {
  IconArchive,
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconSearch,
  IconDotsVertical,
  IconTrash,
  IconArrowUpRight,
  IconDownload,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContent } from "@/context/ContentContext";

export function LibraryView() {
  const {
    blogPosts,
    podcastEpisodes,
    videoStoryboards,
    setActiveBlogPost,
    setActivePodcast,
    setActiveVideo,
    setActiveTab,
    deleteBlogPost,
  } = useContent();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = [
    ...blogPosts.map((b) => ({
      id: b.id,
      title: b.title,
      type: "blog" as const,
      category: b.category,
      status: b.status,
      date: b.createdAt,
      detail: `${b.readingTime} • ${b.content.split(/\s+/).length} words`,
      raw: b,
    })),
    ...podcastEpisodes.map((p) => ({
      id: p.id,
      title: p.episodeTitle,
      type: "podcast" as const,
      category: "Audio Broadcast",
      status: "ready",
      date: p.createdAt,
      detail: `${p.durationMinutes} min • ${p.dialogue.length} dialogue turns`,
      raw: p,
    })),
    ...videoStoryboards.map((v) => ({
      id: v.id,
      title: v.videoTitle,
      type: "video" as const,
      category: v.format,
      status: "rendered",
      date: v.createdAt,
      detail: `${v.scenes.length} scenes • ${v.totalDurationSeconds}s`,
      raw: v,
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenItem = (item: any) => {
    if (item.type === "blog") {
      setActiveBlogPost(item.raw);
      setActiveTab("blog");
    } else if (item.type === "podcast") {
      setActivePodcast(item.raw);
      setActiveTab("podcast");
    } else if (item.type === "video") {
      setActiveVideo(item.raw);
      setActiveTab("video");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconArchive className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Generations & Publications Archive
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {allItems.length} Assets
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete inventory of all synthesized blog articles, conversational podcast audio, and video storyboards
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full sm:w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-2.5 cursor-pointer">
                  All ({allItems.length})
                </TabsTrigger>
                <TabsTrigger value="blog" className="text-xs px-2.5 cursor-pointer">
                  Blogs ({blogPosts.length})
                </TabsTrigger>
                <TabsTrigger value="podcast" className="text-xs px-2.5 cursor-pointer">
                  Podcasts ({podcastEpisodes.length})
                </TabsTrigger>
                <TabsTrigger value="video" className="text-xs px-2.5 cursor-pointer">
                  Videos ({videoStoryboards.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs h-8 pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Publication Asset</TableHead>
                <TableHead>Channel Type</TableHead>
                <TableHead>Category / Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No publications matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleOpenItem(item)}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                          {item.type === "blog" && <IconFileText className="size-4" />}
                          {item.type === "podcast" && <IconHeadphones className="size-4" />}
                          {item.type === "video" && <IconVideo className="size-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-xs sm:text-sm text-foreground">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {item.detail}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase font-mono">
                        {item.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {item.category}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.status === "published" || item.status === "ready" || item.status === "rendered" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {item.date}
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenItem(item)}
                          className="h-7 text-xs px-2"
                        >
                          Open <IconArrowUpRight className="size-3 ml-0.5" />
                        </Button>

                        {item.type === "blog" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBlogPost(item.id)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <IconTrash className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
