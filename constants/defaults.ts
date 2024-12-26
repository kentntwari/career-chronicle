import type { Benchmarks, BenchmarkPayload, SinglePos } from "~/types";

export const DEFAULT_ORGANIZATION_OBJ = {
  name: "",
  slug: "",
  hasCreatedBenchmark: true,
  hasCreatedPositionBefore: true,
  hasCreatedAchievementBefore: true,
  hasCreatedChallengeBefore: true,
  hasCreatedFailureBefore: true,
  hasCreatedProjectBefore: true,
} as const;

export const DEFAULT_POSITION_OBJ = [
  {
    title: "",
    slug: "",
    description: "",
    monthStartedAt: "JANUARY",
    yearStartedAt: 1950,
  } as SinglePos,
  [] as Benchmarks,
  {
    title: "",
    slug: "",
    description: "",
    monthStartedAt: "JANUARY",
    yearStartedAt: 1950,
    createdAt: new Date(),
    updatedAt: new Date(),
    isAchievement: true,
    isFailure: false,
    monthFinishedAt: "DECEMBER",
    yearFinishedAt: 1950,
  } as BenchmarkPayload,
];
