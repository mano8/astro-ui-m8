"use client";

import * as React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

export type ToastNotification = {
  title: string;
  description?: string;
};

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Astro/Starlight drives light/dark via `data-theme` on <html>. Sonner defaults
// to "light" and never reads that attribute, so the very first toast renders
// light regardless of the active theme. Track `data-theme` and hand Sonner an
// explicit theme so every toast — including the first — matches Starlight.
function useStarlightTheme(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function ToastNotificationHost({
  position = "top-right",
}: {
  position?: ToastPosition;
} = {}) {
  const theme = useStarlightTheme();
  return (
    <SonnerToaster
      closeButton
      richColors
      position={position}
      theme={theme}
    />
  );
}

export const toastNotification = {
  success(message: ToastNotification) {
    toast.success(message.title, { description: message.description });
  },
  error(message: ToastNotification) {
    toast.error(message.title, { description: message.description });
  },
  info(message: ToastNotification) {
    toast.info(message.title, { description: message.description });
  },
} as const;
