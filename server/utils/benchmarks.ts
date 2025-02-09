import { Month } from "@prisma/client";
import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { SingleOrg, SinglePos, Benchmark, Benchmarks } from "~/types";

import { z } from "zod";

import * as benchmarks from "~/constants/benchmarks";
import * as k from "~/utils/keys";
import {
  incomingNewProjectBody,
  incomingNewTimelineMarkerBody,
} from "~/utils/zschemas";

export function getSingleResourceCacheKey(
  userEmail: UserType["email"],
  parentOrganization: SingleOrg["slug"],
  parentPosition: SinglePos["slug"],
  benchmark: Benchmark,
  value: string
) {
  if (benchmark === benchmarks.ACHIEVEMENTS)
    return k.resolveUserPosAchievement(
      userEmail,
      parentOrganization,
      parentPosition,
      value
    );

  if (benchmark === benchmarks.PROJECTS)
    return k.resolveUserPosProject(
      userEmail,
      parentOrganization,
      parentPosition,
      value
    );

  if (benchmark === benchmarks.CHALLENGES)
    return k.resolveUserPosChallenge(
      userEmail,
      parentOrganization,
      parentPosition,
      value
    );

  if (benchmark === benchmarks.FAILURES)
    return k.resolveUserPosFailure(
      userEmail,
      parentOrganization,
      parentPosition,
      value
    );

  throw createError({
    statusCode: 400,
    statusMessage: "Bad request",
    message: "Invalid benchmark",
  });
}

export const NOW = new Date();

type NewProject = z.infer<typeof incomingNewProjectBody>;
type OtherNewBenchmark = z.infer<typeof incomingNewTimelineMarkerBody>;
// Must be identical both in db and cache

export function cacheBulkPayload(
  data: OtherNewBenchmark | NewProject,
  benchmark: Benchmark
) {
  return benchmark === benchmarks.PROJECTS
    ? {
        title: data.title.toLocaleLowerCase(),
        slug: data.slug,
        monthStartedAt: data.timeline.month.toUpperCase() as Month,
        yearStartedAt: data.timeline.year,
        createdAt: NOW,
        updatedAt: NOW,
      }
    : {
        title: data.title.toLocaleLowerCase(),
        slug: data.slug,
        monthOccuredAt: data.timeline.month.toUpperCase() as Month,
        yearOccuredAt: data.timeline.year,
        createdAt: NOW,
        updatedAt: NOW,
      };
}

export function cacheBenchmarkPayload(
  data: OtherNewBenchmark | NewProject,
  benchmark: Benchmark
) {
  if (
    benchmark === benchmarks.ACHIEVEMENTS ||
    benchmark === benchmarks.FAILURES
  )
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug,
      description: data.description?.toLocaleLowerCase() ?? null,
      monthOccuredAt: data.timeline.month.toUpperCase() as Month,
      yearOccuredAt: data.timeline.year,
      createdAt: NOW,
      updatedAt: NOW,
    };

  if (benchmark === benchmarks.PROJECTS)
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug,
      description: data.description?.toLocaleLowerCase() ?? null,
      monthStartedAt: data.timeline.month.toUpperCase() as Month,
      yearStartedAt: data.timeline.year,
      monthFinishedAt: null,
      yearFinishedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
      isAchievement: false,
      isFailure: false,
    };

  if (benchmark === benchmarks.CHALLENGES)
    return {
      title: data.title.toLocaleLowerCase(),
      slug: data.slug,
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
    };

  throw createError({
    statusCode: 400,
    statusMessage: "Bad request",
    message: "Invalid benchmark",
  });
}
