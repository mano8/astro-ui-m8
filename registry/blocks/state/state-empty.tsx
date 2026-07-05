"use client";

import * as React from "react";
import { Inbox } from "lucide-react";

export interface StateEmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function StateEmpty({
  title = "No results",
  description = "Nothing matches the current view.",
  action,
  icon,
}: StateEmptyProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border bg-card p-6 text-center text-card-foreground">
      <div className="mb-3 rounded-full border bg-background p-3 text-muted-foreground">
        {icon ?? <Inbox className="size-5" aria-hidden="true" />}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

