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
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-center py-4 font-bold transition-all group-data-[state=collapsed]:py-2">
          <span className="whitespace-nowrap group-data-[state=collapsed]:hidden text-primary">
            AUJ Store Management
          </span>
          <span className="hidden group-data-[state=collapsed]:block text-primary font-bold">
            AUJ
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
