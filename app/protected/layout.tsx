import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarProp } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
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

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routes: SidebarProp[] = [
    {
      title: "Dashboard",
      url: "/protected/main/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Product Sales",
      url: "/protected/main/orders",
      icon: ShoppingBag,
    },
    {
      title: "Print Job",
      url: "/protected/main/print-job",
      icon: PrinterIcon,
    },
    {
      title: "Inventory",
      url: "/protected/main/inventory",
      icon: Warehouse,
    },
    {
      title: "Analytics",
      url: "/protected/main/analytics",
      icon: ChartSpline,
    },
    {
      title: "History",
      url: "/protected/main/history",
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
