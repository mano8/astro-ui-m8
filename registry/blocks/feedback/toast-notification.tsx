"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export type ToastNotification = {
  title: string;
  description?: string;
};

export function ToastNotificationHost() {
  return <SonnerToaster closeButton richColors position="top-right" />;
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
