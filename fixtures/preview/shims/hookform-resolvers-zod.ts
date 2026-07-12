import type { z } from "zod";

export function zodResolver<TSchema extends z.ZodType>(schema: TSchema) {
  return async (values: unknown) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    return {
      values: {},
      errors: Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join("."),
          { message: issue.message },
        ]),
      ),
    };
  };
}
