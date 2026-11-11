import {
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconArrowUpRight,
  IconDotsVertical,
  IconClock,
} from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContent } from "@/context/ContentContext";

export function RecentGenerationsTable() {
  const { blogPosts, podcastEpisodes, videoStoryboards, setActiveTab, setActiveBlogPost, setActivePodcast, setActiveVideo } = useContent();

  const handleOpenBlog = (post: any) => {
    setActiveBlogPost(post);
    setActiveTab("blog");
  };

  const handleOpenPodcast = (episode: any) => {
    setActivePodcast(episode);
    setActiveTab("podcast");
  };

  const handleOpenVideo = (storyboard: any) => {
    setActiveVideo(storyboard);
    setActiveTab("video");
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Recent Publications & Multi-Modal Output Log
          </CardTitle>
          <CardDescription>
            Live status of synthesized blog articles, podcast audio recordings, and video storyboard assets
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("library")}
          className="cursor-pointer text-xs h-8"
        >
          View Full Archive
          <IconArrowUpRight className="size-3.5 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Asset Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category / Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.map((post) => (
              <TableRow key={post.id} className="cursor-pointer hover:bg-muted/40" onClick={() => handleOpenBlog(post)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <IconFileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{post.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <IconClock className="size-3" />
                        <span>{post.readingTime}</span>
                        <span>•</span>
                        <span>{post.keywords.slice(0, 3).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono">
                    Blog Post
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {post.category}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={post.status === "published" ? "default" : "secondary"}
                    className="capitalize text-xs"
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {post.createdAt}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenBlog(post)}>
                        Edit & Review Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setActiveBlogPost(post); setActiveTab("podcast"); }}>
                        Generate Podcast
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setActiveBlogPost(post); setActiveTab("video"); }}>
                        Generate Video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {podcastEpisodes.map((episode) => (
              <TableRow key={episode.id} className="cursor-pointer hover:bg-muted/40" onClick={() => handleOpenPodcast(episode)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <IconHeadphones className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{episode.episodeTitle}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {episode.tagline}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
                    Podcast Audio
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Dual-Speaker ({episode.durationMinutes} min)
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="text-xs">
                    Audio Ready
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {episode.createdAt}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => handleOpenPodcast(episode)}
                  >
                    Play Episode
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {videoStoryboards.map((storyboard) => (
              <TableRow key={storyboard.id} className="cursor-pointer hover:bg-muted/40" onClick={() => handleOpenVideo(storyboard)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <IconVideo className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{storyboard.videoTitle}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {storyboard.scenes.length} scenes • {storyboard.totalDurationSeconds}s runtime
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono border-accent-foreground/40 text-accent-foreground">
                    Video Storyboard
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {storyboard.format}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="text-xs">
                    Rendered
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {storyboard.createdAt}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => handleOpenVideo(storyboard)}
                  >
                    Preview Player
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
