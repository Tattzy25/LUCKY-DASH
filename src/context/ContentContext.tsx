import React, { createContext, useContext, useState, useEffect } from "react";
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
  isGeneratingPodcast: boolean;
  generatePodcast: (post?: BlogPost) => Promise<PodcastEpisode | null>;
  videoStoryboards: VideoStoryboard[];
  activeVideo: VideoStoryboard | null;
  setActiveVideo: (video: VideoStoryboard | null) => void;
  isGeneratingVideo: boolean;
  generateVideo: (post?: BlogPost) => Promise<VideoStoryboard | null>;
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

const defaultSources: SourceItem[] = [
  {
    id: "src-1",
    type: "video",
    title: "Q3 Keynote: Next-Gen Enterprise Ingestion Architectures",
    sourceUrl: "https://youtube.com/watch?v=enterprise-ingest-arch-2026",
    duration: "42:15",
    summary: "Technical keynote analyzing multi-modal data pipelines, latency bottlenecks, and unified ingestion schemas across enterprise content ecosystems.",
    highlights: [
      "Traditional fragmented media handling wastes 64% of production cycles.",
      "Multi-modal embeddings enable unified cross-referencing between video frames and document tables.",
      "Real-time transcription with speaker diarization cuts editorial turnaround from days to minutes.",
    ],
    tags: ["Video Keynote", "Architecture", "Multi-Modal"],
    dateAdded: "2026-11-10",
    selectedForPitch: true,
  },
  {
    id: "src-2",
    type: "audio",
    title: "Executive Interview: Scaling Enterprise Knowledge Synthesis",
    sourceUrl: "internal://podcasts/ep-12-synthesis-vance.mp3",
    duration: "28:40",
    summary: "One-on-one executive briefing discussing organizational hurdles in cross-functional content governance and staying strictly on brand topic.",
    highlights: [
      "Editorial drift occurs when AI synthesis lacks rigid categorical guardrails.",
      "C-Suite readers demand verifiable primary source citations over generated generalizations.",
      "Dual-channel repurposing (audio podcast + video storyboards) drives 3.2x higher audience retention.",
    ],
    tags: ["Executive Audio", "Governance", "Interviews"],
    dateAdded: "2026-11-10",
    selectedForPitch: true,
  },
  {
    id: "src-3",
    type: "file",
    title: "Whitepaper: Enterprise Content Governance & Compliance 2026.pdf",
    fileName: "Enterprise_Governance_2026.pdf",
    fileSize: "4.8 MB",
    summary: "Comprehensive survey of 420 enterprise media leaders documenting data privacy, citation traceability, and structured taxonomies.",
    highlights: [
      "91% of enterprise editorial directors require audit-trailed source citations.",
      "Grounded search integration eliminates 98.4% of model factual hallucination.",
      "Categorical clustering accelerates review committee sign-offs by 55%.",
    ],
    tags: ["PDF Whitepaper", "Benchmark Data", "Compliance"],
    dateAdded: "2026-11-09",
    selectedForPitch: true,
  },
  {
    id: "src-4",
    type: "web_search",
    title: "Grounded Search: State of Generative Audio & Video Storyboards",
    sourceUrl: "https://google.com/search?q=enterprise+ai+multimodal+repurposing",
    summary: "Synthesized live search indices covering the latest 2026 enterprise adoptions in automated podcast synthesis and video motion graphics.",
    highlights: [
      "Dual-speaker audio podcast synthesis now supports conversational backchanneling and natural cadence.",
      "Automated scene storyboards reduce video production pre-visualization costs by 78%.",
      "Enterprise publishing platforms increasingly mandate direct integration with headless CMS targets.",
    ],
    tags: ["Live Web Search", "Market Trends", "Grounded"],
    dateAdded: "2026-11-11",
    selectedForPitch: true,
    groundingUrls: [
      { title: "Enterprise Content Benchmark 2026", uri: "https://gartner.com/content-ai" },
      { title: "Multi-Modal Audio Production Guidelines", uri: "https://w3c.org/standards/audio" },
    ],
  },
];

const defaultPitchState: PitchState = {
  curatedHighlights: [
    "Fragmented multi-modal media handling wastes 64% of enterprise editorial cycles.",
    "Automated topic guardrails and categorical clustering prevent hallucination and editorial drift.",
    "Grounded web search paired with proprietary audio transcription achieves 98.4% factual precision.",
    "Repurposing canonical blog research into dual-speaker podcast audio and video scenes drives 3.2x audience engagement.",
  ],
  categories: [
    {
      name: "Ingestion Architecture",
      points: [
        "Simultaneous video, audio, PDF, and live web search ingestion",
        "Semantic chunking and cross-modal embedding",
      ],
    },
    {
      name: "Governance & Topic Guardrails",
      points: [
        "Defensive topic anchoring to prevent model tangents",
        "Auditable primary source citations",
      ],
    },
    {
      name: "Omnichannel Repurposing",
      points: [
        "Automated dual-host podcast audio scripting and speech synthesis",
        "Chronological scene-by-scene video storyboard generation",
      ],
    },
    {
      name: "Enterprise Velocity",
      points: [
        "Reduction in production cycle from 14 days to 45 minutes",
        "Cross-functional review committee efficiency up 55%",
      ],
    },
  ],
  pitches: [
    {
      id: "angle-1",
      title: "The Architecture of Multi-Source Synthesis: Ingesting Video, Audio, and Web at Enterprise Scale",
      hook: "Why modern content teams are abandoning isolated drafting in favor of unified multi-source intelligence pipelines.",
      targetAudience: "VP of Content, Editorial Directors, Head of Marketing",
      keyArguments: [
        "Eliminating unstructured source silos",
        "Preserving nuanced audio and video insights",
        "Standardizing enterprise design systems",
      ],
      recommendedFormat: "Strategic Deep Dive",
      status: "selected",
    },
    {
      id: "angle-2",
      title: "From Canonical Blog to Broadcast Studio: Automating Podcast Audio and Video Production",
      hook: "How forward-thinking editorial teams write once and immediately broadcast across conversational podcast audio and dynamic video storyboards.",
      targetAudience: "Technical Media Architects, Digital Strategy Directors",
      keyArguments: [
        "Conversational dual-speaker audio synthesis",
        "AI-guided visual scene generation",
        "Multi-channel velocity and reach",
      ],
      recommendedFormat: "Technical Blueprint",
      status: "suggested",
    },
    {
      id: "angle-3",
      title: "Enterprise Content Governance: Enforcing Topic Guardrails Across Generative Pipelines",
      hook: "A practical framework for brand stewards to eliminate hallucination and maintain categorical discipline across high-volume outputs.",
      targetAudience: "Chief Communications Officers, Compliance Leads, Editorial Leads",
      keyArguments: [
        "Defensive topic boundary validation",
        "Traceable source footnotes",
        "Audit-ready verification workflows",
      ],
      recommendedFormat: "Executive Brief",
      status: "suggested",
    },
  ],
  topicGuardrails: [
    "Strictly ground all numerical assertions and quotes in ingested sources.",
    "Prohibit speculative jargon or unverified promotional hype.",
    "Maintain categorical isolation: do not drift into non-enterprise tangents.",
    "Enforce clear editorial distinction between documented facts and forward-looking hypotheses.",
  ],
};

const defaultBlogPost: BlogPost = {
  id: "blog-1",
  title: "The Architecture of Multi-Source Synthesis: Ingesting Video, Audio, and Web at Enterprise Scale",
  slug: "architecture-multi-source-synthesis-enterprise",
  metaDescription: "Learn how enterprise content teams ingest videos, audio recordings, whitepapers, and grounded web search into authoritative long-form publications and downstream multimedia.",
  readingTime: "6 min read",
  keywords: ["Multi-Source Synthesis", "Enterprise Content", "Audio Transcription", "Video Ingestion", "AI Editorial Pipeline"],
  createdAt: "2026-11-11",
  status: "published",
  category: "Architecture & Strategy",
  author: "Enterprise Editorial Lead",
  sourceIds: ["src-1", "src-2", "src-3", "src-4"],
  pitchId: "angle-1",
  content: `# The Architecture of Multi-Source Synthesis: Ingesting Video, Audio, and Web at Enterprise Scale

> **Executive Summary:** Disconnected research documents, raw podcast interviews, webinar recordings, and sprawling web search results routinely overwhelm enterprise content pipelines. By establishing a unified multi-source ingestion engine, organizations can systematically synthesize diverse formats, enforce strict categorical boundaries, and generate authoritative long-form content alongside coordinated podcast and video assets.

---

## 1. The Multi-Source Ingestion Bottleneck

Enterprise content creation rarely begins with a blank page. Modern research teams receive inputs from an increasingly heterogeneous constellation of sources:
- **Audio recordings:** C-suite interviews, customer advisory board sessions, and technical symposium panels.
- **Video collateral:** Product demonstrations, keynote lectures, and customer user conferences.
- **Structured files:** PDF whitepapers, architectural blueprints, and financial disclosures.
- **Live web indices:** Grounded Google search results and industry standard updates.

Historically, synthesising these disparate streams demanded hours of manual transcription, note-taking, and editorial reconciling. Industry research indicates that editorial teams spend upwards of **64% of their production cycle** merely organizing source materials rather than crafting differentiated strategic viewpoints.

| Media Modality | Primary Ingestion Challenge | Automated Synthesis Advantage |
| :--- | :--- | :--- |
| **Video Files & URLs** | Temporal scrubbing and visual keyframe extraction | Automated speech diarization and scene topic clustering |
| **Audio Interviews** | Speaker confusion and conversational colloquialisms | Clean quote attribution and highlight timestamping |
| **Document Files** | Dense formatting and non-linear narrative tables | Semantic chunking and executive distillation |
| **Web Search Grounding** | Outdated indices and hallucinatory drift | Real-time verified citations and anchor URLs |

---

## 2. Topic Guardrails and Categorical Highlight Clustering

A common vulnerability in automated content drafting is **editorial drift**—the tendency of language models to wander into adjacent topics when fed multiple lengthy source documents.

To counteract this, our pipeline enforces a two-tier guardrail system:
1. **Semantic Filtering:** Extracted quotes and facts are checked against the primary thesis. Any tangents outside the defined domain boundaries are flagged and quarantined.
2. **Categorical Taxonomy:** Insights are segmented into functional pillars: *Architecture*, *Operational ROI*, *Regulatory Compliance*, and *Implementation Mechanics*.

\`\`\`
[Video / Audio / File / URL]
           │
           ▼
[Semantic De-duplication & Extraction]
           │
           ▼
   ┌───────┴───────┐
   ▼               ▼
[Pillar 1: ROI] [Pillar 2: Architecture]
   └───────┬───────┘
           ▼
[Authoritative Draft Composer]
\`\`\`

---

## 3. Composing the Enterprise Publication

When composing the final manuscript, tone and structure are paramount. Enterprise readers demand concrete proof points rather than hyperbolic generalities.

### Key Architectural Pillars

- **Provenance Tracking:** Every numerical assertion, metric, or quoted opinion is directly linked to its origin file or URL chunk.
- **Multi-Level Scannability:** Utilizing structured callouts, bold lead-ins, and data tables allows executive decision-makers to extract vital conclusions in under 90 seconds.
- **Actionable Blueprints:** Concluding with immediate, operational implementation steps rather than open-ended summaries.

> **Key Finding:** Grounded web search paired with proprietary audio transcription achieves an average factual recall rate of **98.4%**, eliminating the hallucinations typical of ungrounded generative systems.

---

## 4. Downstream Repurposing: The Triad of Blog, Podcast, and Video

A successful blog post is not the endpoint; it is the canonical knowledge foundation for omnichannel delivery.

Once the verified text is finalized, the platform triggers two synchronized downstream pipelines:
1. **The Podcast Audio Engine:** Deconstructs the core debate into a natural, two-person dialogue (Host and Subject Specialist) formatted with realistic cadence, chapter markers, and synthesized voice audio.
2. **The Video Production Storyboard:** Segments the article into chronological 15-to-30 second visual scenes, complete with AI visual generation prompts, on-screen text overlays, and synchronized voiceover scripts.

---

## 5. Strategic Takeaways for Editorial Leaders

1. **Centralize Ingestion Early:** Never allow audio, video, and text to sit in isolated folders. Ingest and tag them in a single workspace.
2. **Pitch Before Drafting:** Generate and validate strategic angles with editorial stakeholders before generating full long-form copy.
3. **Enforce Design System Consistency:** Consistent typography, polished enterprise components, and clean UI workflows elevate content operations from ad-hoc drafting to a scalable corporate utility.`,
};

const defaultPodcast: PodcastEpisode = {
  id: "pod-1",
  blogPostId: "blog-1",
  episodeTitle: "Episode 48: The Architecture of Multi-Source Content Synthesis",
  tagline: "How enterprise teams turn hours of raw video, audio, and web research into authoritative publications.",
  durationMinutes: 5,
  createdAt: "2026-11-11",
  showNotes: [
    "Why human editorial teams spend 64% of their time just scrubbing media files.",
    "How semantic clustering keeps automated blog synthesis strictly on topic.",
    "The triad approach: connecting blog posts directly to podcasts and video storyboards.",
    "Practical steps for implementing multi-modal content pipelines in enterprise organizations.",
  ],
  chapters: [
    { timestamp: "00:00", title: "Introduction & The Ingestion Bottleneck" },
    { timestamp: "01:20", title: "De-duplicating Video, Audio, and Web Data" },
    { timestamp: "02:50", title: "Enforcing Categorical Topic Guardrails" },
    { timestamp: "04:15", title: "Omnichannel Repurposing & Closing Thoughts" },
  ],
  dialogue: [
    {
      speaker: "Sarah Jenkins",
      role: "host",
      text: "Welcome back to Enterprise Signals. Marcus, today we are dissecting something every modern editorial team struggles with: having too many disparate sources and no clean way to synthesize them.",
      durationSec: 9,
    },
    {
      speaker: "Dr. Marcus Vance",
      role: "guest",
      text: "Exactly, Sarah. You have an hour-long recorded webinar, three podcast interviews, an industry whitepaper, and fresh search results. Traditionally, someone spends days listening, scrubbing, and copy-pasting.",
      durationSec: 10,
    },
    {
      speaker: "Sarah Jenkins",
      role: "host",
      text: "And by the time the blog post is written, the news cycle has already moved on. But what's the architectural solve here?",
      durationSec: 6,
    },
    {
      speaker: "Dr. Marcus Vance",
      role: "guest",
      text: "The breakthrough is unified multi-modal ingestion. Instead of treating video, audio, and text as isolated silos, the system extracts transcripts, clusters the factual highlights into semantic categories, and applies topic guardrails.",
      durationSec: 12,
    },
    {
      speaker: "Sarah Jenkins",
      role: "host",
      text: "Those topic guardrails are critical. Because without them, language models will happily wander into adjacent tangents that have nothing to do with the enterprise thesis.",
      durationSec: 8,
    },
    {
      speaker: "Dr. Marcus Vance",
      role: "guest",
      text: "Spot on. And the beauty of this workflow is what happens right after the blog post is approved. It automatically feeds into this very podcast script you and I are recording, and segments out video storyboard scenes.",
      durationSec: 11,
    },
    {
      speaker: "Sarah Jenkins",
      role: "host",
      text: "A true write-once, distribute-everywhere flywheel. If you want to check out the full technical breakdown, head over to the studio notes. Marcus, fantastic insights as always.",
      durationSec: 9,
    },
    {
      speaker: "Dr. Marcus Vance",
      role: "guest",
      text: "Always a pleasure, Sarah. Keep building.",
      durationSec: 3,
    },
  ],
};

const defaultVideo: VideoStoryboard = {
  id: "vid-1",
  blogPostId: "blog-1",
  videoTitle: "The Architecture of Multi-Source Content Synthesis",
  format: "16:9 Landscape",
  totalDurationSeconds: 70,
  createdAt: "2026-11-11",
  scenes: [
    {
      sceneNumber: 1,
      title: "The Ingestion Crisis",
      durationSeconds: 10,
      visualDescription: "Sleek dark interface showing fragmented media streams—audio waveforms, video files, and whitepapers floating in chaotic 3D motion.",
      aiImagePrompt: "Hyper-clean modern enterprise software dashboard showing floating glowing audio waveforms and video file nodes in cyan and deep navy, cinematic lighting, 8k",
      onScreenText: "64% OF PRODUCTION TIME LOST IN UNSTRUCTURED MEDIA",
      voiceoverNarration: "Every week, enterprise teams generate hours of video webinars, podcast interviews, and research files. Yet turning them into published insights remains a grueling manual grind.",
    },
    {
      sceneNumber: 2,
      title: "Unified Ingestion Architecture",
      durationSeconds: 12,
      visualDescription: "Camera zooms into a central processing nexus where video, audio, files, and live Google web search fuse into an organized data pipeline.",
      aiImagePrompt: "Abstract 3D architectural diagram of synchronized data streams merging into a glowing quantum core, precision cybernetic typography, deep blue gradient",
      onScreenText: "UNIFIED INGESTION: VIDEO • AUDIO • FILES • GROUNDED WEB",
      voiceoverNarration: "Enter the multi-source intelligence engine. By ingesting audio, video, and web data simultaneously, content teams capture every nuance without losing context.",
    },
    {
      sceneNumber: 3,
      title: "Topic Guardrails & Highlight Extraction",
      durationSeconds: 12,
      visualDescription: "Holographic boundary shields locking around the core topics, filtering out noise and highlighting key statistical facts.",
      aiImagePrompt: "Sleek data visualization of semantic clustering with glowing green verified badges and boundary wireframes, studio quality, high precision",
      onScreenText: "STRICT TOPIC GUARDRAILS • ZERO EDITORIAL DRIFT",
      voiceoverNarration: "Automated topic guardrails ensure your narrative never wanders off-track. Key highlights and statistical facts are clustered and verified against grounded source citations.",
    },
    {
      sceneNumber: 4,
      title: "Authoritative Blog Composer",
      durationSeconds: 14,
      visualDescription: "High-speed assembly of an enterprise long-form article on a pristine digital canvas, complete with charts, quotes, and metadata.",
      aiImagePrompt: "Minimalist executive typography layout on an ultra-wide curved screen with glowing charts and quotation callouts, premium corporate aesthetic",
      onScreenText: "PUBLICATION-READY LONG-FORM BLOG POSTS IN MINUTES",
      voiceoverNarration: "In seconds, the system compiles a publication-ready blog post: rich with analysis, verified citations, and authoritative tone designed for executive decision-makers.",
    },
    {
      sceneNumber: 5,
      title: "Omnichannel Repurposing",
      durationSeconds: 12,
      visualDescription: "The blog post splits smoothly into two luminous output channels: a podcast studio waveform player on the left, and a video storyboard timeline on the right.",
      aiImagePrompt: "Split screen 3D visualization of dual broadcast channels: podcast microphone with sound waves on one side, film production storyboard on the other",
      onScreenText: "1 BLOG POST ➔ DUAL-HOST PODCAST + VIDEO STORYBOARD",
      voiceoverNarration: "And it does not stop at text. The blog post instantly generates conversational podcast scripts with audio playback and scene-by-scene video storyboards.",
    },
    {
      sceneNumber: 6,
      title: "Enterprise Velocity",
      durationSeconds: 10,
      visualDescription: "Logos and dashboard metrics scaling to 100%, concluding on the clean OmniContent Studio emblem with subtle cyan particle glows.",
      aiImagePrompt: "Minimalist corporate title card with glowing cyan accent line, deep charcoal background, refined typography, luxury tech branding",
      onScreenText: "OMNICONTENT STUDIO • ELEVATE YOUR EDITORIAL ENGINE",
      voiceoverNarration: "Transform your enterprise content workflow. From raw media to omnichannel publication—at scale.",
    },
  ],
};

const defaultSettings: SystemSettings = {
  brandVoice: "Authoritative, analytical, rigorous, and forward-looking enterprise tone",
  targetAudience: "Enterprise Technology Executives, Chief Content Officers, Product Leaders",
  defaultModel: "gemini-3.8-flash",
  strictnessLevel: "strict",
  autoRepurposeToPodcast: true,
  autoRepurposeToVideo: true,
  defaultCategory: "Architecture & Strategy",
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sources, setSources] = useState<SourceItem[]>(() => {
    const saved = localStorage.getItem("omnicontent_sources");
    return saved ? JSON.parse(saved) : defaultSources;
  });
  const [pitchState, setPitchState] = useState<PitchState | null>(() => {
    const saved = localStorage.getItem("omnicontent_pitch");
    return saved ? JSON.parse(saved) : defaultPitchState;
  });
  const [selectedPitch, setSelectedPitch] = useState<PitchAngle | null>(() => {
    return defaultPitchState.pitches[0] || null;
  });
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem("omnicontent_blogs");
    return saved ? JSON.parse(saved) : [defaultBlogPost];
  });
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(() => {
    return defaultBlogPost;
  });
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);

  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>(() => {
    const saved = localStorage.getItem("omnicontent_podcasts");
    return saved ? JSON.parse(saved) : [defaultPodcast];
  });
  const [activePodcast, setActivePodcast] = useState<PodcastEpisode | null>(() => {
    return defaultPodcast;
  });
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  const [videoStoryboards, setVideoStoryboards] = useState<VideoStoryboard[]>(() => {
    const saved = localStorage.getItem("omnicontent_videos");
    return saved ? JSON.parse(saved) : [defaultVideo];
  });
  const [activeVideo, setActiveVideo] = useState<VideoStoryboard | null>(() => {
    return defaultVideo;
  });
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("omnicontent_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Persistent storage synchronizers
  useEffect(() => {
    localStorage.setItem("omnicontent_sources", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    if (pitchState) {
      localStorage.setItem("omnicontent_pitch", JSON.stringify(pitchState));
    }
  }, [pitchState]);

  useEffect(() => {
    localStorage.setItem("omnicontent_blogs", JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem("omnicontent_podcasts", JSON.stringify(podcastEpisodes));
  }, [podcastEpisodes]);

  useEffect(() => {
    localStorage.setItem("omnicontent_videos", JSON.stringify(videoStoryboards));
  }, [videoStoryboards]);

  useEffect(() => {
    localStorage.setItem("omnicontent_settings", JSON.stringify(settings));
  }, [settings]);

  // Source operations
  const addSource = (sourceData: Omit<SourceItem, "id" | "dateAdded" | "selectedForPitch">): SourceItem => {
    const newSource: SourceItem = {
      ...sourceData,
      id: `src-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
      selectedForPitch: true,
    };
    setSources((prev) => [newSource, ...prev]);
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
    setIsGeneratingPitch(true);
    try {
      const selectedSources = sources.filter((s) => s.selectedForPitch);
      const res = await fetch("/api/pitch/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          topic: topic || "Enterprise Multi-Source Content Synthesis",
          targetAudience: settings.targetAudience,
          tone: settings.brandVoice,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate pitch: ${res.statusText}`);
      }

      const data = await res.json();
      setPitchState(data);
      if (data.pitches && data.pitches.length > 0) {
        setSelectedPitch(data.pitches[0]);
      }
    } catch (err) {
      console.error("Error generating pitch:", err);
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
    setIsGeneratingBlog(true);
    try {
      const selectedSources = sources.filter((s) => s.selectedForPitch);
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          pitch: selectedPitch || pitchState?.pitches[0],
          selectedHighlights: pitchState?.curatedHighlights || [],
          tone: options?.tone || settings.brandVoice,
          blogType: options?.blogType || selectedPitch?.recommendedFormat || "Strategic In-Depth Guide",
          customInstructions: options?.customInstructions,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate blog post: ${res.statusText}`);
      }

      const data = await res.json();
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        title: data.title,
        slug: data.slug || "new-enterprise-article",
        metaDescription: data.metaDescription || "",
        readingTime: data.readingTime || "5 min read",
        keywords: data.keywords || ["Enterprise", "Content"],
        content: data.content,
        createdAt: new Date().toISOString().split("T")[0],
        status: "draft",
        category: selectedPitch?.recommendedFormat || settings.defaultCategory,
        author: "Enterprise Editorial Lead",
        sourceIds: selectedSources.map((s) => s.id),
        pitchId: selectedPitch?.id,
      };

      setBlogPosts((prev) => [newPost, ...prev]);
      setActiveBlogPost(newPost);

      // Auto-repurpose triggers if enabled
      if (settings.autoRepurposeToPodcast) {
        generatePodcast(newPost);
      }
      if (settings.autoRepurposeToVideo) {
        generateVideo(newPost);
      }

      return newPost;
    } catch (err) {
      console.error("Error generating blog:", err);
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
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    if (activeBlogPost?.id === id) {
      setActiveBlogPost(blogPosts.find((p) => p.id !== id) || null);
    }
  };

  // Podcast generation
  const generatePodcast = async (post?: BlogPost): Promise<PodcastEpisode | null> => {
    setIsGeneratingPodcast(true);
    const targetPost = post || activeBlogPost || blogPosts[0];
    if (!targetPost) {
      setIsGeneratingPodcast(false);
      return null;
    }

    try {
      const res = await fetch("/api/podcast/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPost: targetPost,
          episodeTitle: `The Briefing: ${targetPost.title}`,
          hostName: "Sarah Jenkins",
          guestName: "Dr. Marcus Vance",
          targetDuration: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate podcast: ${res.statusText}`);
      }

      const data = await res.json();
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
      return newEpisode;
    } catch (err) {
      console.error("Error generating podcast:", err);
      return null;
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  // Video generation
  const generateVideo = async (post?: BlogPost): Promise<VideoStoryboard | null> => {
    setIsGeneratingVideo(true);
    const targetPost = post || activeBlogPost || blogPosts[0];
    if (!targetPost) {
      setIsGeneratingVideo(false);
      return null;
    }

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPost: targetPost,
          videoFormat: "16:9 Landscape (Keynote / LinkedIn)",
          targetDuration: 75,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate video storyboard: ${res.statusText}`);
      }

      const data = await res.json();
      const newStoryboard: VideoStoryboard = {
        id: `vid-${Date.now()}`,
        blogPostId: targetPost.id,
        videoTitle: data.videoTitle || targetPost.title,
        format: data.format || "16:9 Landscape",
        totalDurationSeconds: data.totalDurationSeconds || 75,
        scenes: data.scenes || [],
        createdAt: new Date().toISOString().split("T")[0],
      };

      setVideoStoryboards((prev) => [newStoryboard, ...prev]);
      setActiveVideo(newStoryboard);
      return newStoryboard;
    } catch (err) {
      console.error("Error generating video storyboard:", err);
      return null;
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
        isGeneratingPodcast,
        generatePodcast,
        videoStoryboards,
        activeVideo,
        setActiveVideo,
        isGeneratingVideo,
        generateVideo,
        settings,
        updateSettings,
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
