import type { Benchmarks } from "~/types";

import { redis } from "@/lib/redis";
import * as store from "~/utils/keys";
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

    const organization = validateParams(
      event,
      "organization"
    ).toLocaleLowerCase();
    const position = validateParams(event, "position").toLocaleLowerCase();

    const rawQuery = getQuery(event);
    const parsedQuery = queriedBenchmark.safeParse(rawQuery.kind);

    if (!parsedQuery.success)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid query",
      });

    // TODO: cached values and database must always match.
    const cached = await redis.lrange<Benchmarks[number]>(
      store.resolvePosBenchmark(
        user.email,
        organization,
        position,
        parsedQuery.data
      ),
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
            store.resolvePosBenchmark(
              user.email,
              organization,
              position,
              parsedQuery.data
            ),
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
