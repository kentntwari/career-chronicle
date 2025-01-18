import type { H3Event } from "h3";
import type { Benchmark } from "~/types";

import { queriedBenchmark } from "~/utils/zschemas";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;
const BENCHMARK = "benchmark" as const;

type Target = typeof ORGANIZATION | typeof POSITION | typeof BENCHMARK;

export function validateParams(
  event: H3Event,
  target: typeof ORGANIZATION
): string;
export function validateParams(event: H3Event, target: typeof POSITION): string;
export function validateParams(
  event: H3Event,
  target: typeof BENCHMARK
): Benchmark;
export function validateParams<T extends Target>(event: H3Event, directory: T) {
  switch (true) {
    case directory === "organization":
      const organization = getRouterParam(event, "orgSlug");
      if (!organization)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Organization not provided",
        });
      else return organization.toLocaleLowerCase();

    case directory === "position":
      const position = getRouterParam(event, "positionSlug");
      if (!position)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Position not provided",
        });
      else return position.toLocaleLowerCase();

    case directory === "benchmark":
      const benchmark = getRouterParam(event, "benchmark");

      if (!benchmark)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Benchmark not provided",
        });

      const parsed = queriedBenchmark.safeParse(benchmark);
      if (!parsed.success)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Invalid benchmark",
        });

      return parsed.data;

    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
      });
  }
}
