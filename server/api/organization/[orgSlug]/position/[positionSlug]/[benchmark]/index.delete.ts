import type { Benchmarks } from "~/types";

import { z } from "zod";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import * as benchmarks from "~/constants/benchmarks";
import * as k from "~/utils/keys";
import { deletePositionBenchmark as deleteDbBenchmark } from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:benchmark"
    );

    const user = await kinde.getUser();

    const orgSlug = validateParams(event, "organization").toLocaleLowerCase();
    const positionSlug = validateParams(event, "position").toLocaleLowerCase();
    const benchmarkCategory = validateParams(event, "benchmark");

    // incoming data to delete
    const rawQuery = await getQuery(event);

    if (!rawQuery || !rawQuery.data)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "No data provided",
      });

    const parsed = z.string().min(1).safeParse(rawQuery.data);

    if (!parsed.success)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid data provided",
      });

    let keys: string[] = [];
    const args = [user.email, orgSlug, positionSlug, parsed.data] as const;
    switch (benchmarkCategory) {
      case benchmarks.ACHIEVEMENTS:
        keys = await redis.keys(`*${k.resolveUserPosAchievement(...args)}*`);
        break;

      case benchmarks.CHALLENGES:
        keys = await redis.keys(`*${k.resolveUserPosChallenge(...args)}*`);
        break;

      case benchmarks.FAILURES:
        keys = await redis.keys(`*${k.resolveUserPosFailure(...args)}*`);
        break;

      case benchmarks.PROJECTS:
        keys = await redis.keys(`*${k.resolveUserPosProject(...args)}*`);
        break;

      default:
        keys = [];
        break;
    }

    const cachedBenchmarks = await redis.lrange<Benchmarks[number]>(
      k.resolveUserPosBenchmark(
        user.email,
        orgSlug,
        positionSlug,
        benchmarkCategory
      ),
      0,
      -1
    );
    const benchmark = cachedBenchmarks.find((b) => b.slug === parsed.data);

    // init pipeline
    const p = redis.pipeline();
    if (keys.length) p.del(...keys);
    if (benchmark)
      p.lrem<Benchmarks[number]>(
        k.resolveUserPosBenchmark(
          user.email,
          orgSlug,
          positionSlug,
          benchmarkCategory
        ),
        0,
        {
          ...benchmark,
        }
      );

    await Promise.all([
      p.exec(),
      deleteDbBenchmark(orgSlug, positionSlug, benchmarkCategory, parsed.data),
    ]);

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
