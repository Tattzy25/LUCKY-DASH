import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ContentProvider, useContent } from "@/context/ContentContext";

// Modular Feature Views
import { DashboardView } from "@/features/dashboard/DashboardView";
import { SourcesView } from "@/features/sources/SourcesView";
import { PitchView } from "@/features/pitch/PitchView";
import { BlogView } from "@/features/blog/BlogView";
import { PodcastView } from "@/features/podcast/PodcastView";
import { VideoView } from "@/features/video/VideoView";
import { LibraryView } from "@/features/library/LibraryView";
import { AnalyticsView } from "@/features/analytics/AnalyticsView";
import { SettingsView } from "@/features/settings/SettingsView";
import { ConnectionsView } from "@/features/connections/ConnectionsView";
import { HelpView } from "@/features/help/HelpView";

function StudioLayout() {
  const { activeTab, setActiveTab, sources, generateBlog } = useContent();

  const handleQuickCreate = () => {
    setActiveTab("blog");
    generateBlog();
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "sources":
        return <SourcesView />;
      case "pitch":
        return <PitchView />;
      case "blog":
        return <BlogView />;
      case "podcast":
        return <PodcastView />;
      case "video":
        return <VideoView />;
      case "library":
        return <LibraryView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      case "connections":
        return <ConnectionsView />;
      case "help":
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickCreate={handleQuickCreate}
        sourcesCount={sources.length}
      />
      <SidebarInset>
        <SiteHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onQuickCreate={handleQuickCreate}
        />
        <main className="flex flex-1 flex-col overflow-y-auto">
          {renderActiveView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ContentProvider>
        <StudioLayout />
        <Toaster richColors closeButton />
      </ContentProvider>
    </ThemeProvider>
  );
}
