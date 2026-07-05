"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface StateUnauthorizedProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function StateUnauthorized({
  title = "Access required",
  description = "Sign in with an account that has permission to view this page.",
  action,
}: StateUnauthorizedProps) {
  return (
    <Alert>
      <ShieldAlert className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p>{description}</p>
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}

