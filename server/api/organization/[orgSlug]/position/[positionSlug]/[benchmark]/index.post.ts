import type { Achievement, Project, Failure, Challenge } from "@prisma/client";
import type { SingleOrg, Benchmark, Benchmarks } from "~/types";

import { redis } from "~/lib/redis";
import * as store from "~/utils/keys";
import * as benchmarks from "~/constants/benchmarks";
import * as authorize from "@/server/utils/authorize";
import {
  getCacheKey,
  cacheBenchmarkPayload,
  cacheBulkPayload,
  NOW,
} from "~/server/utils/benchmarks";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:benchmark"
    );
    const user = await kinde.getUser();

    const parentOrganization = validateParams(
      event,
      "organization"
    ).toLocaleLowerCase();

    const parentPosition = validateParams(
      event,
      "position"
    ).toLocaleLowerCase();

    const benchmark = validateParams(event, "benchmark");

    await enforcePlanLimits(event, user, benchmark, {
      targetOrganization: parentOrganization,
      targetPosition: parentPosition,
    });

    const submitted = await validateSubmission(
      event,
      benchmark as Benchmark & (typeof benchmarks)["PROJECTS"]
    );

    // Cannot be null because it must traverse the parent organization and
    // set it before it reaches this point
    const cachedOrganization = (await redis.hgetall<SingleOrg>(
      store.resolveOrg(user.email, parentOrganization)
    )) as NonNullable<SingleOrg>;

    await Promise.all([
      // 1
      redis.rpush<Benchmarks[number]>(
        store.resolvePosBenchmark(
          user.email,
          parentOrganization,
          parentPosition,
          benchmark
        ),
        { ...cacheBulkPayload(submitted, benchmark) }
      ),
      // 2
      redis.hset(store.resolveOrg(user.email, parentOrganization), {
        ...cacheNewStatePayload(cachedOrganization, benchmark),
      }),
      // 3
      redis.hset(
        getCacheKey(
          user.email,
          parentOrganization,
          parentPosition,
          benchmark,
          submitted.slug
        ),
        {
          ...(cacheBenchmarkPayload(submitted, benchmark) as Omit<
            Achievement | Failure | Project | Challenge,
            "id" | "positionId"
          >),
        }
      ),
      // 4
      createPositionBenchmark(parentOrganization, parentPosition, benchmark, {
        ...submitted,
        createdAt: NOW,
        updatedAt: NOW,
      }),
    ]);

    return null;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});

function cacheNewStatePayload(
  parentOrg: Omit<SingleOrg, "name" | "slug" | "hasCreatedPositionBefore">,
  benchmark: (typeof benchmarks)[keyof typeof benchmarks]
) {
  switch (true) {
    case !parentOrg.hasCreatedAchievementBefore &&
      benchmark === benchmarks.ACHIEVEMENTS:
      return { ...parentOrg, hasCreatedAchievementBefore: true };

    case !parentOrg.hasCreatedChallengeBefore &&
      benchmark === benchmarks.CHALLENGES:
      return { ...parentOrg, hasCreatedChallengeBefore: true };

    case !parentOrg.hasCreatedFailureBefore &&
      benchmark === benchmarks.FAILURES:
      return { ...parentOrg, hasCreatedFailureBefore: true };

    case !parentOrg.hasCreatedProjectBefore &&
      benchmark === benchmarks.PROJECTS:
      return { ...parentOrg, hasCreatedProjectBefore: true };

    default:
      return { ...parentOrg };
  }
}
