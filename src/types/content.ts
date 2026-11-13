export type SourceType = "video" | "audio" | "file" | "web_search" | "web_url";

export interface SourceItem {
  id: string;
  type: SourceType;
  title: string;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  summary: string;
  highlights: string[];
  rawContent?: string;
  tags: string[];
  dateAdded: string;
  selectedForPitch: boolean;
  groundingUrls?: { title: string; uri: string }[];
}

export interface PitchCategory {
  name: string;
  points: string[];
}

export interface PitchAngle {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
  keyArguments: string[];
  recommendedFormat: string;
  status?: "suggested" | "selected" | "approved";
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  readingTime: string;
  keywords: string[];
  content: string;
  pitchId?: string;
  sourceIds: string[];
  createdAt: string;
  status: "draft" | "review" | "published";
  category: string;
  author: string;
}

export interface PodcastDialogueTurn {
  speaker: string;
  role: "host" | "guest" | "narrator";
  text: string;
  durationSec: number;
}

export interface PodcastChapter {
  timestamp: string;
  title: string;
}

export interface PodcastEpisode {
  id: string;
  blogPostId: string;
  episodeTitle: string;
  tagline: string;
  durationMinutes: number;
  showNotes: string[];
  chapters: PodcastChapter[];
  dialogue: PodcastDialogueTurn[];
  createdAt: string;
  audioDataUrl?: string;
}

export interface VideoScene {
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  visualDescription: string;
  aiImagePrompt: string;
  onScreenText: string;
  voiceoverNarration: string;
  audioDataUrl?: string;
}

export interface VideoStoryboard {
  id: string;
  blogPostId: string;
  sourceTitle?: string;
  videoTitle: string;
  format: string;
  voiceName?: string;
  totalDurationSeconds: number;
  scenes: VideoScene[];
  createdAt: string;
}

export interface SystemSettings {
  brandVoice: string;
  targetAudience: string;
  defaultModel: string;
  strictnessLevel: "balanced" | "strict" | "exploratory";
  autoRepurposeToPodcast: boolean;
  autoRepurposeToVideo: boolean;
  defaultCategory: string;
  webhookUrl?: string;
}
