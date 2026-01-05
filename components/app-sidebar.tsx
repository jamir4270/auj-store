import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export type SidebarProp = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type SidebarProps = {
  routes: SidebarProp[];
};

export function AppSidebar({ routes }: SidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-y-2 border-accent">
        <SidebarContent>
          <div className="flex items-center justify-center py-4 font-bold transition-all group-data-[state=collapsed]:py-2">
            <span className="whitespace-nowrap group-data-[state=collapsed]:hidden">
              AUJ Store Management
            </span>
            <span className="hidden group-data-[state=collapsed]:block">
              AUJ
            </span>
          </div>
        </SidebarContent>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full items-center justify-center bg-primary text-primary-foreground shadow hover:bg-primary/90"
            asChild
          >
            <LogoutButton />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
