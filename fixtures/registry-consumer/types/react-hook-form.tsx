import * as React from "react";

export type FieldValues = Record<string, unknown>;
export type DefaultValues<TValues extends FieldValues> = Partial<TValues>;
export type SubmitHandler<TValues extends FieldValues> = (data: TValues) => void | Promise<void>;

export interface UseFormProps<TValues extends FieldValues> {
  defaultValues?: DefaultValues<TValues>;
  resolver?: unknown;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
}

export interface UseFormReturn<TValues extends FieldValues> {
  handleSubmit: (
    onSubmit: SubmitHandler<TValues>,
  ) => React.FormEventHandler<HTMLFormElement>;
  register: (name: keyof TValues & string) => React.InputHTMLAttributes<HTMLInputElement>;
}

export function useForm<TValues extends FieldValues>(
  _props: UseFormProps<TValues>,
): UseFormReturn<TValues> {
  return {
    handleSubmit: (onSubmit) => (event) => {
      event.preventDefault();
      void onSubmit({} as TValues);
    },
    register: (name) => ({ name }),
  };
}

export function FormProvider<TValues extends FieldValues>({
  children,
}: React.PropsWithChildren<UseFormReturn<TValues>>) {
  return <>{children}</>;
}
