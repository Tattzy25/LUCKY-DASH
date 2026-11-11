import * as React from "react";
import { IconCirclePlusFilled, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface NavItem {
  id: string;
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function NavMain({
  items,
  activeTab,
  onSelectTab,
  onQuickCreate,
}: {
  items: NavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  onQuickCreate?: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Blog Creation"
              onClick={onQuickCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer font-medium"
            >
              <IconCirclePlusFilled className="size-4" />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
              variant="outline"
              onClick={() => onSelectTab("pitch")}
              title="Pitch Ideas"
            >
              <IconSparkles className="size-4 text-primary" />
              <span className="sr-only">AI Pitch</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => onSelectTab(item.id)}
                  className={`cursor-pointer transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="size-4" />}
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className="ml-auto text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
