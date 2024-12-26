import type { BenchmarkPayload } from "~/types";

import { z } from "zod";

import { redis } from "@/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { loadBenchmark } from "~/server/utils/db";
import { getCacheKey } from "~/server/utils/benchmarks";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;
const BENCHMARK = "benchmark" as const;

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "read:benchmark"
    );

    const user = await kinde.getUser();

    const organization = validateParams(
      event,
      ORGANIZATION
    ).toLocaleLowerCase();
    const position = validateParams(event, POSITION).toLocaleLowerCase();
    const benchmark = validateParams(event, BENCHMARK);

    const query = getQuery(event);
    const parsedQuery = z.string().min(1).safeParse(query.payload);

    if (!parsedQuery.success)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid query",
      });

    const cached = await redis.hgetall<BenchmarkPayload>(
      getCacheKey(
        user.email,
        organization,
        position,
        benchmark,
        parsedQuery.data
      )
    );

    if (cached) return cached;

    const dbBenchmark = await loadBenchmark(
      organization,
      position,
      benchmark,
      parsedQuery.data
    );

    if (!dbBenchmark)
      throw createError({
        statusCode: 404,
        statusMessage: "Not found",
        message: "Benchmark not found",
      });

    await redis.hset(
      getCacheKey(
        user.email,
        organization,
        position,

        benchmark,
        parsedQuery.data
      ),
      dbBenchmark
    );

    return dbBenchmark;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
  return null;
});
