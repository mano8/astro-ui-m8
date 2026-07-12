import * as React from "react";

export type FieldValues = Record<string, unknown>;
export type DefaultValues<TValues extends FieldValues> = Partial<TValues>;
export type SubmitHandler<TValues extends FieldValues> =
  | ((data: TValues) => void)
  | ((data: TValues) => Promise<void>);

type ResolverResult<TValues extends FieldValues> = {
  errors?: Record<string, { message?: string }>;
  values?: Partial<TValues>;
};

type Resolver<TValues extends FieldValues> = (
  values: TValues,
) => Promise<ResolverResult<TValues>> | ResolverResult<TValues>;

export interface UseFormProps<TValues extends FieldValues> {
  defaultValues?: DefaultValues<TValues>;
  resolver?: Resolver<TValues>;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
}

export interface UseFormReturn<TValues extends FieldValues> {
  handleSubmit: (
    onSubmit: SubmitHandler<TValues>,
  ) => React.FormEventHandler<HTMLFormElement>;
  register: (name: keyof TValues & string) => React.InputHTMLAttributes<HTMLInputElement>;
  reset: (values?: DefaultValues<TValues>) => void;
  values: TValues;
  errors: Record<string, { message?: string }>;
}

export interface FormProviderProps<TValues extends FieldValues>
  extends React.PropsWithChildren<UseFormReturn<TValues>> {}

export function useForm<TValues extends FieldValues>({
  defaultValues,
  resolver,
}: UseFormProps<TValues>): UseFormReturn<TValues> {
  const [values, setValues] = React.useState<TValues>(() => ({
    ...(defaultValues ?? {}),
  }) as TValues);
  const [errors, setErrors] = React.useState<Record<string, { message?: string }>>({});

  const register = React.useCallback(
    (name: keyof TValues & string): React.InputHTMLAttributes<HTMLInputElement> => ({
      name,
      value: String(values[name] ?? ""),
      onChange: (event) => {
        const nextValue = event.currentTarget.value;
        setValues((current) => ({
          ...current,
          [name]: nextValue,
        }));
      },
    }),
    [values],
  );

  const handleSubmit = React.useCallback(
    (onSubmit: SubmitHandler<TValues>) => async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (resolver) {
        const resolved = await resolver(values);
        const nextErrors = resolved.errors ?? {};
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
          return;
        }
      } else {
        setErrors({});
      }
      await onSubmit(values);
    },
    [resolver, values],
  );

  const reset = React.useCallback((nextValues?: DefaultValues<TValues>) => {
    setValues((nextValues ?? defaultValues ?? {}) as TValues);
    setErrors({});
  }, [defaultValues]);

  return {
    handleSubmit,
    register,
    reset,
    values,
    errors,
  };
}

export function FormProvider<TValues extends FieldValues>({
  children,
}: FormProviderProps<TValues>) {
  return <>{children}</>;
}
