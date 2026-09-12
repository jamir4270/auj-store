"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span className="group-data-[state=collapsed]:hidden">Log out</span>
    </button>
  );
}
