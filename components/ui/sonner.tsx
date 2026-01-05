"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-6 text-green-400 stroke-3" />,
        info: <InfoIcon className="size-6" />,
        warning: (
          <TriangleAlertIcon className="size-6 text-orange-400 stroke-3" />
        ),
        error: <OctagonXIcon className="size-6 text-red-500" />,
        loading: (
          <Loader2Icon className="size-6 animate-spin text-blue-500 stroke-3" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--color-foreground)",
          "--normal-text": "var(--color-background)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
