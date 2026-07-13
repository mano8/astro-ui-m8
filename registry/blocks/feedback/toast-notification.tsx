"use client";

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

export function ToastNotificationHost({
  position = "top-right",
}: {
  position?: ToastPosition;
} = {}) {
  return <SonnerToaster closeButton richColors position={position} />;
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
