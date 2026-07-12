"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface UseZodDialogFormOptions<TValues extends FieldValues>
  extends Omit<UseFormProps<TValues>, "resolver" | "defaultValues"> {
  schema: z.ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
}

export function useZodDialogForm<TValues extends FieldValues>({
  schema,
  defaultValues,
  ...options
}: UseZodDialogFormOptions<TValues>) {
  return useForm<TValues>({
    ...options,
    defaultValues,
    resolver: zodResolver(schema),
  });
}

export interface DialogFormProps<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: SubmitHandler<TValues>;
  title: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  formId?: string;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
}

export function DialogForm<TValues extends FieldValues>({
  form,
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  children,
  trigger,
  formId,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitting = false,
}: DialogFormProps<TValues>) {
  const reactId = React.useId();
  const resolvedFormId = formId ?? `dialog-form-${reactId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <FormProvider {...form}>
          <form
            id={resolvedFormId}
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {children}
          </form>
        </FormProvider>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" form={resolvedFormId} disabled={submitting}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface DestructiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirming = false,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={confirming} onClick={() => void onConfirm()}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

