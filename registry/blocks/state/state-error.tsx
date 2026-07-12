"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface StateErrorProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function StateError({
  title = "Something went wrong",
  description = "The request could not be completed.",
  retryLabel = "Try again",
  onRetry,
  action,
}: StateErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p>{description}</p>
          {onRetry || action ? (
            <div className="flex flex-wrap gap-2">
              {onRetry ? (
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  {retryLabel}
                </Button>
              ) : null}
              {action}
            </div>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}

