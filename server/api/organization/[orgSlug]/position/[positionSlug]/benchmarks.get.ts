import type { Benchmarks } from "~/types";

import { redis } from "@/lib/redis";
import { resolveUserPosBenchmark } from "~/utils/keys";
import * as authorize from "@/server/utils/authorize";
import { loadPositionBenchmarks } from "~/server/utils/db";
import { queriedBenchmark } from "~/utils/zschemas";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "read:benchmark"
    );

    const user = await kinde.getUser();

    const organization = validateParams(event, "organization");
    const position = validateParams(event, "position");

    const rawQuery = getQuery(event);
    const parsedQuery = queriedBenchmark.safeParse(rawQuery.kind);

    if (!parsedQuery.success)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid query",
      });

    const CACHED_FN_ARGS = [
      user.email,
      organization,
      position,
      parsedQuery.data,
    ] as const;

    // TODO: cached values and database must always match.
    const cached = await redis.lrange<Benchmarks[number]>(
      resolveUserPosBenchmark(...CACHED_FN_ARGS),
      0,
      -1
    );

    switch (true) {
      case cached.length > 0:
        return cached;

      default:
        const dbBenchmarks = await loadPositionBenchmarks(
          { id: user.id, email: user.email },
          organization,
          position,
          parsedQuery.data
        );

        if (!dbBenchmarks) return [];

        for (const benchmark of dbBenchmarks)
          await redis.rpush(
            resolveUserPosBenchmark(...CACHED_FN_ARGS),
            benchmark
          );

        return dbBenchmarks;
    }
  } catch (error) {
    console.log(error);
    throwError(error);
  }
  return null;
});
