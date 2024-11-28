import type {
  Month,
  Achievement,
  Project,
  Failure,
  Challenge,
} from "@prisma/client";
import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { SingleOrg, Benchmarks, SinglePos } from "~/types";

import { z } from "zod";
import { redis } from "~/lib/redis";
import * as store from "~/utils/keys";
import * as benchmarks from "~/benchmarks";
import {
  queriedBenchmark,
  incomingNewTimelineMarkerBody,
  incomingNewProjectBody,
} from "~/utils/zschemas";
import * as authorize from "@/server/utils/authorize";

// Must be identical both in db and cache
const NOW = new Date();

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

    const rawQuery = getQuery(event);

    if (!rawQuery || !rawQuery.kind)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid query",
      });

    const parsedQuery = queriedBenchmark.safeParse(rawQuery.kind);

    if (!parsedQuery.success)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
        message: "Invalid query",
      });

    await enforcePlanLimits(event, user, parsedQuery.data, {
      targetOrganization: parentOrganization,
      targetPosition: parentPosition,
    });

    const submitted = await validateSubmission(
      event,
      parsedQuery.data as (typeof benchmarks)[keyof typeof benchmarks] &
        (typeof benchmarks)["PROJECTS"]
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
          parsedQuery.data
        ),
        { ...cacheBulkPayload(submitted, parsedQuery.data) }
      ),
      // 2
      redis.hset(store.resolveOrg(user.email, parentOrganization), {
        ...cacheNewStatePayload(cachedOrganization, parsedQuery.data),
      }),
      // 3
      redis.hset(
        getCacheKey(
          user.email,
          parentOrganization,
          parentPosition,
          parsedQuery.data,
          submitted.slug
        ),
        {
          ...(cacheBenchmarkPayload(submitted, parsedQuery.data) as Omit<
            Achievement | Failure | Project | Challenge,
            "id" | "positionId"
          >),
        }
      ),
      // 4
      createPositionBenchmark(
        parentOrganization,
        parentPosition,
        parsedQuery.data,
        { ...submitted, createdAt: NOW, updatedAt: NOW }
      ),
    ]);

    return null;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});

type NewProject = z.infer<typeof incomingNewProjectBody>;
type OtherNewBenchmark = z.infer<typeof incomingNewTimelineMarkerBody>;
function cacheBulkPayload(
  data: OtherNewBenchmark | NewProject,
  benchmark: (typeof benchmarks)[keyof typeof benchmarks]
) {
  return benchmark === benchmarks.PROJECTS
    ? {
        title: data.title.toLocaleLowerCase(),
        slug: data.slug.toLocaleLowerCase(),
        monthStartedAt: data.timeline.month.toUpperCase() as Month,
        yearStartedAt: data.timeline.year,
        createdAt: NOW,
        updatedAt: NOW,
      }
    : {
        title: data.title.toLocaleLowerCase(),
        slug: data.slug.toLocaleLowerCase(),
        monthOccuredAt: data.timeline.month.toUpperCase() as Month,
        yearOccuredAt: data.timeline.year,
        createdAt: NOW,
        updatedAt: NOW,
      };
}

function cacheBenchmarkPayload(
  data: OtherNewBenchmark | NewProject,
  benchmark: (typeof benchmarks)[keyof typeof benchmarks]
) {
  if (
    benchmark === benchmarks.ACHIEVEMENTS ||
    benchmark === benchmarks.FAILURES
  )
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug.toLocaleLowerCase(),
      description: data.description?.toLocaleLowerCase() ?? null,
      monthOccuredAt: data.timeline.month.toUpperCase() as Month,
      yearOccuredAt: data.timeline.year,
      createdAt: NOW,
      updatedAt: NOW,
    } satisfies Omit<Achievement | Failure, "id" | "positionId">;

  if (benchmark === benchmarks.PROJECTS)
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug.toLocaleLowerCase(),
      description: data.description?.toLocaleLowerCase() ?? null,
      monthStartedAt: data.timeline.month.toUpperCase() as Month,
      yearStartedAt: data.timeline.year,
      monthFinishedAt: null,
      yearFinishedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
      isAchievement: false,
      isFailure: false,
    } satisfies Omit<Project, "id" | "positionId">;

  if (benchmark === benchmarks.CHALLENGES)
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug.toLocaleLowerCase(),
      description: data.description?.toLocaleLowerCase() ?? null,
      monthOccuredAt: data.timeline.month.toUpperCase() as Month,
      yearOccuredAt: data.timeline.year,
      monthSolvedAt: null,
      yearSolvedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
      isAchievement: false,
      isFailure: false,
      isProject: false,
    } satisfies Omit<Challenge, "id" | "positionId">;

  throw createError({
    statusCode: 400,
    statusMessage: "Bad request",
    message: "Invalid benchmark",
  });
}

function cacheNewStatePayload(
  parentOrg: Omit<SingleOrg, "name" | "slug" | "hasCreatedPositionBefore">,
  benchmark: (typeof benchmarks)[keyof typeof benchmarks]
) {
  switch (true) {
    case !parentOrg.hasCreatedAchievementBefore &&
      benchmark === benchmarks.ACHIEVEMENTS:
      console.log("1");
      return { ...parentOrg, hasCreatedAchievementBefore: true };

    case !parentOrg.hasCreatedChallengeBefore &&
      benchmark === benchmarks.CHALLENGES:
      console.log("2");
      return { ...parentOrg, hasCreatedChallengeBefore: true };

    case !parentOrg.hasCreatedFailureBefore &&
      benchmark === benchmarks.FAILURES:
      console.log("3");
      return { ...parentOrg, hasCreatedFailureBefore: true };

    case !parentOrg.hasCreatedProjectBefore &&
      benchmark === benchmarks.PROJECTS:
      console.log("4");
      return { ...parentOrg, hasCreatedProjectBefore: true };

    default:
      return { ...parentOrg };
  }
}

function getCacheKey(
  userEmail: UserType["email"],
  orgSlug: SingleOrg["slug"],
  positionSlug: SinglePos["slug"],
  benchmark: (typeof benchmarks)[keyof typeof benchmarks],
  benchmarkSlug: string
) {
  switch (benchmark) {
    case benchmarks.ACHIEVEMENTS:
      return store.resolvePosAchievement(
        userEmail,
        orgSlug,
        positionSlug,
        benchmarkSlug
      );

    case benchmarks.CHALLENGES:
      return store.resolvePosChallenge(
        userEmail,
        orgSlug,
        positionSlug,
        benchmarkSlug
      );

    case benchmarks.FAILURES:
      return store.resolvePosFailure(
        userEmail,
        orgSlug,
        positionSlug,
        benchmarkSlug
      );

    default:
      return store.resolvePosProject(
        userEmail,
        orgSlug,
        positionSlug,
        benchmarkSlug
      );
  }
}
