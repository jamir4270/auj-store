import { cookies } from "next/headers";
import { AppSidebar, SidebarProp } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import "../globals.css";

import {
  ChartSpline,
  History,
  LayoutDashboard,
  Warehouse,
  PrinterIcon,
  ShoppingBag,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routes: SidebarProp[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Product Sales",
      url: "/orders",
      icon: ShoppingBag,
    },
    {
      title: "Print Jobs",
      url: "/print-jobs",
      icon: PrinterIcon,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Warehouse,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartSpline,
    },
    {
      title: "Sales History",
      url: "/history",
      icon: History,
    },
  ];

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar routes={routes} />
      <SidebarInset>
        <main className="flex w-full h-full flex-col gap-4 p-4">
          <header className="flex flex-row justify-between w-full h-14 shrink-0 items-center border-b px-4">
            <SidebarTrigger />
            <div className="font-bold">AUJ Store Management</div>
            <ThemeSwitcher />
          </header>
          {children}
          <Toaster position="top-center" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
