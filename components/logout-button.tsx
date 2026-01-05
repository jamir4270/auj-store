"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button
      className="w-full items-center justify-center bg-primary text-primary-foreground shadow hover:bg-primary/90"
      onClick={logout}
    >
      <LogOut />
      <span className="group-data-[state=collapsed]:hidden">Log out</span>
    </Button>
  );
}
