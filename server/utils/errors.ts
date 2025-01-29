import { H3Error } from "h3";

const POSITION_NOT_FOUND = "Position not found";
const BENCHMARKS_NOT_FOUND = "Benchmarks not found";
const BENCHMARK_NOT_FOUND = "Benchmark not found";

export const errorMessages = {
  POSITION_NOT_FOUND,
  BENCHMARKS_NOT_FOUND,
  BENCHMARK_NOT_FOUND,
};

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
