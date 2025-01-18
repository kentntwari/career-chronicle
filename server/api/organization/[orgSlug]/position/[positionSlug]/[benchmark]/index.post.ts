import type {
  Achievement,
  Project,
  Failure,
  Challenge,
  Month,
} from "@prisma/client";
import type { SingleOrg, Benchmark, Benchmarks } from "~/types";

import { redis } from "~/lib/redis";
import * as store from "~/utils/keys";
import * as benchmarks from "~/constants/benchmarks";
import * as authorize from "@/server/utils/authorize";
import {
  getSingleResourceCacheKey,
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

    const orgSlug = validateParams(event, "organization");
    const positionSlug = validateParams(event, "position");
    const benchmark = validateParams(event, "benchmark");

    await enforcePlanLimits(event, user, benchmark, {
      targetOrganization: orgSlug,
      targetPosition: positionSlug,
    });

    const submitted = await validateSubmission(
      event,
      benchmark as Benchmark & (typeof benchmarks)["PROJECTS"]
    );
    const coerced = {
      title: submitted.title.toLocaleLowerCase(),
      description: submitted.description?.toLocaleLowerCase() ?? undefined,
      slug: submitted.slug.toLocaleLowerCase(),
      timeline: {
        ...submitted.timeline,
        month: submitted.timeline.month.toLocaleUpperCase() as Month,
      },
    } satisfies typeof submitted;

    // Cannot be null because it must traverse the parent organization and
    // set it before it reaches this point
    const cachedOrganization = (await redis.hgetall<SingleOrg>(
      store.resolveUserOrg(user.email, orgSlug)
    )) as NonNullable<SingleOrg>;

    await Promise.all([
      // 1
      redis.rpush<Benchmarks[number]>(
        store.resolveUserPosBenchmark(
          user.email,
          orgSlug,
          positionSlug,
          benchmark
        ),
        { ...cacheBulkPayload(coerced, benchmark) }
      ),
      // 2
      redis.hset(store.resolveUserOrg(user.email, orgSlug), {
        ...cacheNewStatePayload(cachedOrganization, benchmark),
      }),
      // 3
      redis.hset(
        getSingleResourceCacheKey(
          user.email,
          orgSlug,
          positionSlug,
          benchmark,
          coerced.slug
        ),
        {
          ...(cacheBenchmarkPayload(coerced, benchmark) as Omit<
            Achievement | Failure | Project | Challenge,
            "id" | "positionId"
          >),
        }
      ),
      // 4
      createPositionBenchmark(orgSlug, positionSlug, benchmark, {
        ...coerced,
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
