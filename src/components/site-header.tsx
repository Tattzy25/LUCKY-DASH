import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  IconSearch,
  IconDashboard,
  IconFolders,
  IconSparkles,
  IconFileText,
  IconHeadphones,
  IconVideo,
  IconArchive,
  IconChartBar,
  IconSettings,
  IconPlugConnected,
} from "@tabler/icons-react";

interface SiteHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onQuickCreate?: () => void;
}

const tabTitles: Record<string, string> = {
  dashboard: "Command Center",
  sources: "Sources & Search Hub",
  pitch: "Pitch & Angle Extraction",
  blog: "Blog Composer Studio",
  podcast: "Podcast Audio Studio",
  video: "Video Production Studio",
  library: "Generations Archive",
  analytics: "Pipeline Analytics",
  settings: "System Configuration",
  connections: "Publishing & Export",
  help: "Workflow Guide",
};

export function SiteHeader({ activeTab, onSelectTab, onQuickCreate }: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 lg:gap-3">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator
            orientation="vertical"
            className="mx-1 lg:mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-sm lg:text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
              {tabTitles[activeTab] || "Content Studio"}
            </h1>
          </div>

          <div className="mx-auto flex max-w-md flex-1 items-center justify-center py-[3px]">
            <InputGroup
              className="min-h-[35px] max-w-sm w-full cursor-pointer bg-muted/40 hover:bg-muted/70 transition-colors"
              onClick={() => setOpen(true)}
            >
              <InputGroupAddon align="inline-start">
                <IconSearch className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Jump to workspace module... (⌘K)"
                readOnly
                className="cursor-pointer text-xs"
              />
              <InputGroupAddon align="inline-end">
                <Kbd className="text-[10px]">⌘</Kbd>
                <Kbd className="text-[10px]">K</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {onQuickCreate && (
              <Button
                size="sm"
                variant="outline"
                onClick={onQuickCreate}
                className="hidden sm:inline-flex text-xs h-8 gap-1.5 cursor-pointer font-medium whitespace-nowrap"
              >
                <IconSparkles className="size-3.5 text-primary" />
                <span>Compose Post</span>
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Switch module..." />
        <CommandList>
          <CommandEmpty>No matching modules found.</CommandEmpty>
          <CommandGroup heading="Content Workflows">
            <CommandItem onSelect={() => handleSelect("dashboard")}>
              <IconDashboard className="size-4 mr-2" />
              <span>Command Center</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("sources")}>
              <IconFolders className="size-4 mr-2" />
              <span>Sources Hub (Video, Audio, Files, Web)</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("pitch")}>
              <IconSparkles className="size-4 mr-2" />
              <span>Pitch & Angle Extraction</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("blog")}>
              <IconFileText className="size-4 mr-2" />
              <span>Blog Composer Studio</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("podcast")}>
              <IconHeadphones className="size-4 mr-2" />
              <span>Podcast Audio Studio</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("video")}>
              <IconVideo className="size-4 mr-2" />
              <span>Video Production Studio</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("library")}>
              <IconArchive className="size-4 mr-2" />
              <span>Generations Archive</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("analytics")}>
              <IconChartBar className="size-4 mr-2" />
              <span>Pipeline Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem onSelect={() => handleSelect("settings")}>
              <IconSettings className="size-4 mr-2" />
              <span>System Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("connections")}>
              <IconPlugConnected className="size-4 mr-2" />
              <span>Publishing & Export</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
