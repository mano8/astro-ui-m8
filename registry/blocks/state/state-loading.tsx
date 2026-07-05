"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export interface StateLoadingProps {
  title?: string;
  description?: string;
  rows?: number;
}

export function StateLoading({
  title = "Loading",
  description = "Fetching the latest data.",
  rows = 3,
}: StateLoadingProps) {
  const skeletonRows = Array.from({ length: Math.max(1, rows) }, (_, index) => index);

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border bg-card p-4 text-card-foreground"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 space-y-3">
        {skeletonRows.map((row) => (
          <Skeleton key={row} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

