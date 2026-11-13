import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import type {
  SourceItem,
  PitchAngle,
  PitchCategory,
  BlogPost,
  PodcastEpisode,
  VideoStoryboard,
  SystemSettings,
} from "@/types/content";

interface PitchState {
  curatedHighlights: string[];
  categories: PitchCategory[];
  pitches: PitchAngle[];
  topicGuardrails: string[];
}

export interface VideoGenerateOptions {
  videoFormat?: string;
  targetDuration?: number;
  customTopic?: string;
  voiceName?: string;
}

interface ContentContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sources: SourceItem[];
  addSource: (source: Omit<SourceItem, "id" | "dateAdded" | "selectedForPitch">) => SourceItem;
  removeSource: (id: string) => void;
  toggleSelectSource: (id: string) => void;
  selectAllSources: (selected: boolean) => void;
  pitchState: PitchState | null;
  selectedPitch: PitchAngle | null;
  isGeneratingPitch: boolean;
  generatePitch: (topic?: string) => Promise<void>;
  selectPitch: (pitch: PitchAngle) => void;
  blogPosts: BlogPost[];
  activeBlogPost: BlogPost | null;
  setActiveBlogPost: (post: BlogPost | null) => void;
  isGeneratingBlog: boolean;
  generateBlog: (options?: {
    customInstructions?: string;
    blogType?: string;
    tone?: string;
  }) => Promise<BlogPost | null>;
  saveBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  podcastEpisodes: PodcastEpisode[];
  activePodcast: PodcastEpisode | null;
  setActivePodcast: (episode: PodcastEpisode | null) => void;
  updatePodcastEpisode: (episode: PodcastEpisode) => void;
  isGeneratingPodcast: boolean;
  generatePodcast: (post?: BlogPost) => Promise<PodcastEpisode | null>;
  videoStoryboards: VideoStoryboard[];
  activeVideo: VideoStoryboard | null;
  setActiveVideo: (video: VideoStoryboard | null) => void;
  updateVideoStoryboard: (storyboard: VideoStoryboard) => void;
  deleteVideoStoryboard: (id: string) => void;
  isGeneratingVideo: boolean;
  generateVideo: (post?: BlogPost, options?: VideoGenerateOptions) => Promise<VideoStoryboard | null>;
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetWorkspace: () => void;
}

const defaultSettings: SystemSettings = {
  brandVoice: "Authoritative, analytical, rigorous, and forward-looking tone",
  targetAudience: "Executives, Engineers, and Product Leaders",
  defaultModel: "gemini-4-hydrogen",
  strictnessLevel: "strict",
  autoRepurposeToPodcast: false,
  autoRepurposeToVideo: false,
  defaultCategory: "Strategy & Architecture",
  webhookUrl: "",
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed saving ${key}:`, err);
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [sources, setSources] = useState<SourceItem[]>(() => safeLoad("omnicontent_sources_v2", []));
  const [pitchState, setPitchState] = useState<PitchState | null>(() =>
    safeLoad("omnicontent_pitch_v2", null)
  );
  const [selectedPitch, setSelectedPitch] = useState<PitchAngle | null>(() => {
    const p = safeLoad<PitchState | null>("omnicontent_pitch_v2", null);
    return p?.pitches?.[0] || null;
  });
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => safeLoad("omnicontent_blogs_v2", []));
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(() => {
    const loaded = safeLoad<BlogPost[]>("omnicontent_blogs_v2", []);
    return loaded[0] || null;
  });
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);

  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>(() =>
    safeLoad("omnicontent_podcasts_v2", [])
  );
  const [activePodcast, setActivePodcast] = useState<PodcastEpisode | null>(() => {
    const loaded = safeLoad<PodcastEpisode[]>("omnicontent_podcasts_v2", []);
    return loaded[0] || null;
  });
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  const [videoStoryboards, setVideoStoryboards] = useState<VideoStoryboard[]>(() =>
    safeLoad("omnicontent_videos_v2", [])
  );
  const [activeVideo, setActiveVideo] = useState<VideoStoryboard | null>(() => {
    const loaded = safeLoad<VideoStoryboard[]>("omnicontent_videos_v2", []);
    return loaded[0] || null;
  });
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>(() =>
    safeLoad("omnicontent_settings_v2", defaultSettings)
  );

  // Persistent storage synchronizers (strip large audio base64 blobs from localStorage to avoid quota overflow)
  useEffect(() => {
    safeSave("omnicontent_sources_v2", sources);
  }, [sources]);

  useEffect(() => {
    if (pitchState) {
      safeSave("omnicontent_pitch_v2", pitchState);
    } else {
      localStorage.removeItem("omnicontent_pitch_v2");
    }
  }, [pitchState]);

  useEffect(() => {
    safeSave("omnicontent_blogs_v2", blogPosts);
  }, [blogPosts]);

  useEffect(() => {
    const stripped = podcastEpisodes.map(({ audioDataUrl: _omit, ...rest }) => rest);
    safeSave("omnicontent_podcasts_v2", stripped);
  }, [podcastEpisodes]);

  useEffect(() => {
    const stripped = videoStoryboards.map((sb) => ({
      ...sb,
      scenes: sb.scenes.map(({ audioDataUrl: _omit, ...sceneRest }) => sceneRest),
    }));
    safeSave("omnicontent_videos_v2", stripped);
  }, [videoStoryboards]);

  useEffect(() => {
    safeSave("omnicontent_settings_v2", settings);
  }, [settings]);

  // Source operations
  const addSource = (
    sourceData: Omit<SourceItem, "id" | "dateAdded" | "selectedForPitch">
  ): SourceItem => {
    const newSource: SourceItem = {
      ...sourceData,
      id: `src-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
      selectedForPitch: true,
    };
    setSources((prev) => [newSource, ...prev]);
    toast.success(`Added source: ${newSource.title}`);
    return newSource;
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSelectSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selectedForPitch: !s.selectedForPitch } : s))
    );
  };

  const selectAllSources = (selected: boolean) => {
    setSources((prev) => prev.map((s) => ({ ...s, selectedForPitch: selected })));
  };

  // Pitch generation
  const generatePitch = async (topic?: string) => {
    const selectedSources = sources.filter((s) => s.selectedForPitch);
    if (selectedSources.length === 0 && !topic?.trim()) {
      toast.error("Add or select at least one source first.");
      return;
    }

    setIsGeneratingPitch(true);
    try {
      const res = await fetch("/api/pitch/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          topic: topic || "",
          targetAudience: settings.targetAudience,
          tone: settings.brandVoice,
          model: settings.defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate pitch (${res.status})`);
      }

      setPitchState(data);
      if (data.pitches && data.pitches.length > 0) {
        setSelectedPitch(data.pitches[0]);
      }
      toast.success("Generated editorial angles from your sources.");
    } catch (err: any) {
      console.error("Error generating pitch:", err);
      toast.error(err?.message || "Pitch generation failed.");
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const selectPitch = (pitch: PitchAngle) => {
    setSelectedPitch(pitch);
    if (pitchState) {
      setPitchState({
        ...pitchState,
        pitches: pitchState.pitches.map((p) => ({
          ...p,
          status: p.id === pitch.id ? "selected" : "suggested",
        })),
      });
    }
  };

  // Blog generation
  const generateBlog = async (options?: {
    customInstructions?: string;
    blogType?: string;
    tone?: string;
  }): Promise<BlogPost | null> => {
    const selectedSources = sources.filter((s) => s.selectedForPitch);
    if (selectedSources.length === 0 && !selectedPitch && !options?.customInstructions) {
      toast.error("Select at least one source or pitch angle before composing.");
      return null;
    }

    setIsGeneratingBlog(true);
    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          pitch: selectedPitch || pitchState?.pitches[0],
          selectedHighlights: pitchState?.curatedHighlights || [],
          tone: options?.tone || settings.brandVoice,
          blogType: options?.blogType || selectedPitch?.recommendedFormat || "Strategic Guide",
          customInstructions: options?.customInstructions,
          model: settings.defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate blog post (${res.status})`);
      }

      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        title: data.title,
        slug: data.slug || "generated-article",
        metaDescription: data.metaDescription || "",
        readingTime: data.readingTime || "5 min read",
        keywords: data.keywords || [],
        content: data.content,
        createdAt: new Date().toISOString().split("T")[0],
        status: "draft",
        category: selectedPitch?.recommendedFormat || settings.defaultCategory,
        author: "Editorial Team",
        sourceIds: selectedSources.map((s) => s.id),
        pitchId: selectedPitch?.id,
      };

      setBlogPosts((prev) => [newPost, ...prev]);
      setActiveBlogPost(newPost);
      toast.success("Blog post generated.");

      if (settings.autoRepurposeToPodcast) {
        generatePodcast(newPost);
      }
      if (settings.autoRepurposeToVideo) {
        generateVideo(newPost);
      }

      return newPost;
    } catch (err: any) {
      console.error("Error generating blog:", err);
      toast.error(err?.message || "Blog generation failed.");
      return null;
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const saveBlogPost = (updated: BlogPost) => {
    setBlogPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activeBlogPost?.id === updated.id) {
      setActiveBlogPost(updated);
    }
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (activeBlogPost?.id === id) {
        setActiveBlogPost(remaining[0] || null);
      }
      return remaining;
    });
  };

  // Podcast generation
  const generatePodcast = async (post?: BlogPost): Promise<PodcastEpisode | null> => {
    const targetPost = post || activeBlogPost || blogPosts[0];
    if (!targetPost) {
      toast.error("Create or select a blog post first.");
      return null;
    }

    setIsGeneratingPodcast(true);
    try {
      const res = await fetch("/api/podcast/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPost: targetPost,
          episodeTitle: `Episode: ${targetPost.title}`,
          hostName: "Sarah Jenkins",
          guestName: "Dr. Marcus Vance",
          targetDuration: 5,
          model: settings.defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate podcast (${res.status})`);
      }

      const newEpisode: PodcastEpisode = {
        id: `pod-${Date.now()}`,
        blogPostId: targetPost.id,
        episodeTitle: data.episodeTitle,
        tagline: data.tagline,
        durationMinutes: data.durationMinutes || 5,
        showNotes: data.showNotes || [],
        chapters: data.chapters || [],
        dialogue: data.dialogue || [],
        createdAt: new Date().toISOString().split("T")[0],
      };

      setPodcastEpisodes((prev) => [newEpisode, ...prev]);
      setActivePodcast(newEpisode);
      toast.success("Podcast script generated.");
      return newEpisode;
    } catch (err: any) {
      console.error("Error generating podcast:", err);
      toast.error(err?.message || "Podcast generation failed.");
      return null;
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const updatePodcastEpisode = (updated: PodcastEpisode) => {
    setPodcastEpisodes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activePodcast?.id === updated.id) {
      setActivePodcast(updated);
    }
  };

  // Video generation
  const generateVideo = async (
    post?: BlogPost,
    options?: VideoGenerateOptions
  ): Promise<VideoStoryboard | null> => {
    const targetPost = post || activeBlogPost || blogPosts[0];
    if (!targetPost && !options?.customTopic?.trim()) {
      toast.error("Select a blog post or enter a video topic first.");
      return null;
    }

    setIsGeneratingVideo(true);
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPost: targetPost,
          customTopic: options?.customTopic,
          videoFormat: options?.videoFormat || "16:9 Landscape",
          targetDuration: options?.targetDuration || 60,
          model: settings.defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate video storyboard (${res.status})`);
      }

      const newStoryboard: VideoStoryboard = {
        id: `vid-${Date.now()}`,
        blogPostId: targetPost?.id || "custom",
        sourceTitle: targetPost?.title || options?.customTopic || "Custom Brief",
        videoTitle: data.videoTitle || targetPost?.title || "Generated Video",
        format: data.format || options?.videoFormat || "16:9 Landscape",
        voiceName: options?.voiceName || "Kore",
        totalDurationSeconds: data.totalDurationSeconds || 60,
        scenes: data.scenes || [],
        createdAt: new Date().toISOString().split("T")[0],
      };

      setVideoStoryboards((prev) => [newStoryboard, ...prev]);
      setActiveVideo(newStoryboard);
      toast.success(`Video storyboard generated (${newStoryboard.scenes.length} scenes).`);
      return newStoryboard;
    } catch (err: any) {
      console.error("Error generating video storyboard:", err);
      toast.error(err?.message || "Video generation failed.");
      return null;
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const updateVideoStoryboard = (updated: VideoStoryboard) => {
    const total = updated.scenes.reduce((acc, s) => acc + Math.max(1, Number(s.durationSeconds) || 6), 0);
    const normalized: VideoStoryboard = {
      ...updated,
      totalDurationSeconds: total,
      scenes: updated.scenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 })),
    };
    setVideoStoryboards((prev) => prev.map((v) => (v.id === normalized.id ? normalized : v)));
    if (activeVideo?.id === normalized.id) {
      setActiveVideo(normalized);
    }
  };

  const deleteVideoStoryboard = (id: string) => {
    setVideoStoryboards((prev) => {
      const remaining = prev.filter((v) => v.id !== id);
      if (activeVideo?.id === id) {
        setActiveVideo(remaining[0] || null);
      }
      return remaining;
    });
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetWorkspace = () => {
    setSources([]);
    setPitchState(null);
    setSelectedPitch(null);
    setBlogPosts([]);
    setActiveBlogPost(null);
    setPodcastEpisodes([]);
    setActivePodcast(null);
    setVideoStoryboards([]);
    setActiveVideo(null);
    toast.success("Workspace cleared.");
  };

  return (
    <ContentContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sources,
        addSource,
        removeSource,
        toggleSelectSource,
        selectAllSources,
        pitchState,
        selectedPitch,
        isGeneratingPitch,
        generatePitch,
        selectPitch,
        blogPosts,
        activeBlogPost,
        setActiveBlogPost,
        isGeneratingBlog,
        generateBlog,
        saveBlogPost,
        deleteBlogPost,
        podcastEpisodes,
        activePodcast,
        setActivePodcast,
        updatePodcastEpisode,
        isGeneratingPodcast,
        generatePodcast,
        videoStoryboards,
        activeVideo,
        setActiveVideo,
        updateVideoStoryboard,
        deleteVideoStoryboard,
        isGeneratingVideo,
        generateVideo,
        settings,
        updateSettings,
        resetWorkspace,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
