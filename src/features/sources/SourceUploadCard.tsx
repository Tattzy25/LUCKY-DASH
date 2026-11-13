import { useState, useRef } from "react";
import {
  IconVideo,
  IconHeadphones,
  IconFileUpload,
  IconPlus,
  IconUpload,
  IconLoader,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import type { SourceType } from "@/types/content";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function SourceUploadCard() {
  const { addSource } = useContent();
  const [activeTab, setActiveTab] = useState<SourceType>("video");
  const [isIngesting, setIsIngesting] = useState(false);

  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && !title) {
      setTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !pastedText.trim()) {
      toast.error("Upload a file or paste transcript/document text first.");
      return;
    }

    setIsIngesting(true);
    try {
      let textContent = pastedText.trim();
      let base64Data: string | undefined;
      let mimeType: string | undefined;
      let fileName: string | undefined;
      let fileSize: string | undefined;

      if (selectedFile) {
        fileName = selectedFile.name;
        fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
        mimeType = selectedFile.type || "application/octet-stream";

        const isPlainText =
          mimeType.startsWith("text/") ||
          /\.(txt|md|csv|json)$/i.test(selectedFile.name);

        if (isPlainText && !textContent) {
          textContent = await selectedFile.text();
        } else if (!textContent) {
          if (selectedFile.size > 20 * 1024 * 1024) {
            throw new Error("File exceeds 20 MB upload limit. Paste transcript text or use a smaller clip.");
          }
          base64Data = await readFileAsBase64(selectedFile);
        }
      }

      const res = await fetch("/api/sources/ingest-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || fileName || "Ingested Source",
          fileName,
          mimeType,
          base64Data,
          textContent: textContent || undefined,
          sourceType: activeTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Ingestion failed (${res.status})`);
      }

      addSource({
        type: activeTab,
        title: title.trim() || data.title || fileName || "Ingested Source",
        sourceUrl: sourceUrl.trim() || undefined,
        fileName,
        fileSize,
        duration: duration.trim() || undefined,
        summary: data.summary,
        highlights: data.highlights || [],
        rawContent: data.rawContent,
        tags: data.tags || [activeTab],
      });

      setTitle("");
      setSourceUrl("");
      setDuration("");
      setPastedText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Failed to ingest source.");
    } finally {
      setIsIngesting(false);
    }
  };

  const acceptTypes =
    activeTab === "video"
      ? "video/*,.mp4,.webm,.mov,.txt,.md"
      : activeTab === "audio"
      ? "audio/*,.mp3,.wav,.m4a,.ogg,.webm,.txt"
      : ".pdf,.txt,.md,.csv,.json,application/pdf,text/*";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Media & Document Ingestion</CardTitle>
        <CardDescription className="text-xs">
          Upload video, audio, or PDF/text files for real AI transcription and highlight extraction, or paste raw text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as SourceType);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="w-full"
        >
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

          <TabsContent value={activeTab} className="mt-0">
            <form onSubmit={handleIngest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Source Title</Label>
                  <Input
                    placeholder="e.g. Q4 Product Briefing"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    {activeTab === "file" ? "Upload File (PDF, TXT, MD, CSV)" : "Upload Media File (up to 20 MB)"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept={acceptTypes}
                      onChange={handleFilePick}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs w-full justify-start truncate cursor-pointer"
                    >
                      <IconUpload className="size-3.5 mr-1.5 shrink-0" />
                      <span className="truncate">
                        {selectedFile ? selectedFile.name : "Choose file..."}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {activeTab !== "file" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Reference URL (Optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (Optional)</Label>
                    <Input
                      placeholder="e.g. 12:30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">
                  Or Paste Transcript / Document Text Directly
                </Label>
                <Textarea
                  placeholder="Paste full transcript, notes, or document text to analyze..."
                  rows={3}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isIngesting || (!selectedFile && !pastedText.trim())}
                  className="h-8 text-xs cursor-pointer"
                >
                  {isIngesting ? (
                    <>
                      <IconLoader className="size-3.5 mr-1 animate-spin" />
                      Transcribing & Extracting...
                    </>
                  ) : (
                    <>
                      <IconPlus className="size-3.5 mr-1" />
                      Ingest & Analyze
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
