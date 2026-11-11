import * as React from "react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ChatDemo } from "@/components/chat";

// User profile data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh w-96 border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border shrink-0">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-0">
        <ChatDemo />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
