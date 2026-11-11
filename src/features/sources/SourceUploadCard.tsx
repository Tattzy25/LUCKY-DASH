import { useState } from "react";
import {
  IconVideo,
  IconHeadphones,
  IconFileUpload,
  IconPlus,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useContent } from "@/context/ContentContext";

export function SourceUploadCard() {
  const { addSource } = useContent();
  const [activeTab, setActiveTab] = useState("video");

  // Video Form State
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("18:30");
  const [videoTranscript, setVideoTranscript] = useState("");

  // Audio Form State
  const [audioTitle, setAudioTitle] = useState("");
  const [audioSpeaker, setAudioSpeaker] = useState("Executive Interview");
  const [audioDuration, setAudioDuration] = useState("24:10");
  const [audioTranscript, setAudioTranscript] = useState("");

  // Document Form State
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Whitepaper");
  const [docContent, setDocContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle) return;

    addSource({
      type: "video",
      title: videoTitle,
      sourceUrl: videoUrl || "https://internal-media.corp.net/recordings/webinar.mp4",
      duration: videoDuration || "15:00",
      summary: videoTranscript ? videoTranscript.slice(0, 180) + "..." : "Recorded enterprise session covering core technical updates and market milestones.",
      highlights: [
        "Key product release architecture explained with technical diagrams.",
        "Addressing scalability bottlenecks in enterprise deployments.",
        "Roadmap highlights for the upcoming fiscal quarter.",
      ],
      rawContent: videoTranscript || "Full video transcript and audio track extraction.",
      tags: ["Video Asset", "Keynote", "Product Demo"],
    });

    setVideoTitle("");
    setVideoUrl("");
    setVideoTranscript("");
  };

  const handleAddAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitle) return;

    addSource({
      type: "audio",
      title: audioTitle,
      duration: audioDuration || "20:00",
      summary: audioTranscript ? audioTranscript.slice(0, 180) + "..." : `Recorded discussion featuring ${audioSpeaker} addressing organizational strategy and technology roadmaps.`,
      highlights: [
        "First-person account of migration from legacy stack to automated pipelines.",
        "Cost considerations and budget justification for C-Suite executives.",
        "Change management recommendations for editorial and engineering teams.",
      ],
      rawContent: audioTranscript || `Audio transcription log for ${audioTitle}`,
      tags: ["Audio Interview", "Podcast Source", audioSpeaker],
    });

    setAudioTitle("");
    setAudioTranscript("");
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    addSource({
      type: "file",
      title: docTitle,
      fileName: fileName || `${docTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      fileSize: "3.2 MB",
      summary: docContent ? docContent.slice(0, 180) + "..." : "Authoritative enterprise reference documentation outlining architectural standards and compliance criteria.",
      highlights: [
        "Regulatory compliance requirements for multi-region operations.",
        "Benchmark comparison across competing architectural models.",
        "Recommended checklists for production deployment.",
      ],
      rawContent: docContent || "Extracted textual content from verified enterprise file.",
      tags: ["Document", docCategory, "Whitepaper"],
    });

    setDocTitle("");
    setDocContent("");
    setFileName("");
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Media & File Ingestion Engine</CardTitle>
        <CardDescription className="text-xs">
          Upload video recordings, podcast audio interviews, or research whitepapers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-3">
            <TabsTrigger value="video" className="text-xs gap-1.5 cursor-pointer">
              <IconVideo className="size-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs gap-1.5 cursor-pointer">
              <IconHeadphones className="size-3.5" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs gap-1.5 cursor-pointer">
              <IconFileUpload className="size-3.5" />
              Document
            </TabsTrigger>
          </TabsList>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-3 mt-0">
            <form onSubmit={handleAddVideo} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Video Title / Topic</Label>
                  <Input
                    placeholder="e.g. 2026 Keynote: Next-Gen Media"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Video URL / File Source</Label>
                  <Input
                    placeholder="YouTube link, MP4 URL, or internal S3"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Video Transcript / Key Timestamps</Label>
                <Textarea
                  placeholder="Paste video speech transcript, speaker notes, or meeting takeaways..."
                  rows={2}
                  value={videoTranscript}
                  onChange={(e) => setVideoTranscript(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground">Duration:</Label>
                  <Input
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="text-xs h-7 w-20"
                  />
                </div>
                <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer">
                  <IconPlus className="size-3.5 mr-1" />
                  Ingest Video Source
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-3 mt-0">
            <form onSubmit={handleAddAudio} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Interview / Recording Title</Label>
                  <Input
                    placeholder="e.g. C-Suite Roundtable on Data Governance"
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Key Speaker / Guests</Label>
                  <Input
                    placeholder="e.g. CTO & Head of Research"
                    value={audioSpeaker}
                    onChange={(e) => setAudioSpeaker(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Audio Transcript / Quotes</Label>
                <Textarea
                  placeholder="Paste audio dialogue, interview quotes, or speaker notes..."
                  rows={2}
                  value={audioTranscript}
                  onChange={(e) => setAudioTranscript(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground">Duration:</Label>
                  <Input
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    className="text-xs h-7 w-20"
                  />
                </div>
                <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer">
                  <IconPlus className="size-3.5 mr-1" />
                  Ingest Audio Interview
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Document Tab */}
          <TabsContent value="file" className="space-y-3 mt-0">
            <form onSubmit={handleAddDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Document Title</Label>
                  <Input
                    placeholder="e.g. 2026 Cloud Scalability Whitepaper"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">File Attachment / Name</Label>
                  <Input
                    placeholder="e.g. Q3_Compliance_Audit.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Document Excerpts / Text</Label>
                <Textarea
                  placeholder="Paste whitepaper executive summary, table metrics, or core findings..."
                  rows={2}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground">Category:</Label>
                  <Input
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="text-xs h-7 w-28"
                  />
                </div>
                <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer">
                  <IconPlus className="size-3.5 mr-1" />
                  Ingest Document
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
