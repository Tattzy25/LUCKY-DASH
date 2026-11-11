import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function Calendars({
  calendars,
}: {
  calendars: {
    name: string;
    items: string[];
  }[];
}) {
  return (
    <>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu>
            {calendars.map((calendar, index) => (
              <Collapsible
                key={calendar.name}
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <span>{calendar.name}</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 border-l-0 px-0">
                      {calendar.items.map((item) => (
                        <SidebarMenuSubItem key={item}>
                          <SidebarMenuSubButton>
                            <div className="flex size-4 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground">
                              <Check className="size-3 text-sidebar-primary" />
                            </div>
                            <span>{item}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
    </>
  );
}
