import { H3Error } from "h3";

export function throwError(error: unknown): H3Error {
  if (error instanceof H3Error)
    throw createError({
      ...error,
    });

  throw createError({
    statusCode: 500,
    statusMessage: "Internal server error",
  });
}
