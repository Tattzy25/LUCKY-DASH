import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFileText,
  IconHeadphones,
  IconHelp,
  IconInnerShadowTop,
  IconPlugConnected,
  IconSettings,
  IconSparkles,
  IconVideo,
  IconFolders,
  IconArchive,
} from "@tabler/icons-react";
import { NavMain, type NavItem } from "@/components/nav-main";
import { NavSecondary, type NavSecondaryItem } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const userData = {
  name: "Editorial Workspace",
  email: "studio@omnicontent.app",
  avatar: "",
};

const navMainItems: NavItem[] = [
  {
    id: "dashboard",
    title: "Command Center",
    icon: IconDashboard,
  },
  {
    id: "sources",
    title: "Sources & Search",
    icon: IconFolders,
  },
  {
    id: "pitch",
    title: "Pitch & Angles",
    icon: IconSparkles,
  },
  {
    id: "blog",
    title: "Blog Studio",
    icon: IconFileText,
  },
  {
    id: "podcast",
    title: "Podcast Audio",
    icon: IconHeadphones,
  },
  {
    id: "video",
    title: "Video Studio",
    icon: IconVideo,
  },
  {
    id: "library",
    title: "Generations Log",
    icon: IconArchive,
  },
  {
    id: "analytics",
    title: "Pipeline Analytics",
    icon: IconChartBar,
  },
];

const navSecondaryItems: NavSecondaryItem[] = [
  {
    id: "settings",
    title: "System Config",
    icon: IconSettings,
  },
  {
    id: "connections",
    title: "Publishing & Export",
    icon: IconPlugConnected,
  },
  {
    id: "help",
    title: "Workflow Docs",
    icon: IconHelp,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onQuickCreate?: () => void;
  sourcesCount?: number;
}

export function AppSidebar({
  activeTab,
  onSelectTab,
  onQuickCreate,
  sourcesCount,
  ...props
}: AppSidebarProps) {
  const dynamicNavItems = React.useMemo(() => {
    return navMainItems.map((item) => {
      if (item.id === "sources" && sourcesCount !== undefined && sourcesCount > 0) {
        return { ...item, badge: `${sourcesCount}` };
      }
      return item;
    });
  }, [sourcesCount]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => onSelectTab("dashboard")}
              className="data-[slot=sidebar-menu-button]:p-1.5 cursor-pointer hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <IconInnerShadowTop className="size-5" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold tracking-tight">
                  OmniContent
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Content Studio
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={dynamicNavItems}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onQuickCreate={onQuickCreate}
        />
        <NavSecondary
          items={navSecondaryItems}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} onOpenProfile={() => onSelectTab("settings")} />
      </SidebarFooter>
    </Sidebar>
  );
}
