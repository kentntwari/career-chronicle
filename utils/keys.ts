import type { Tier } from "@prisma/client";

import { z } from "zod";

import { userCredentials, queriedBenchmark } from "./zschemas";

export const DATA_STORE = "data";

type UserEmail = z.infer<typeof userCredentials>["email"];

export function resolveFirstTimerUser(email: UserEmail) {
  return `user:${email.toLocaleLowerCase()}:first-time`;
}

export function resolveUserAccessToken(email: UserEmail) {
  return `user:${email.toLocaleLowerCase()}:access-token`;
}

export function resolveUserOrgs(email: UserEmail) {
  return `user:${email.toLocaleLowerCase()}:orgs`;
}

export function resolveUserPlan(email: UserEmail) {
  return `user:${email.toLocaleLowerCase()}:plan`;
}

export function resolvePlanLimits(plan: Tier) {
  return `plan:${plan}:limits`;
}

export function resolveOrg(userEmail: UserEmail, orgSlug: string) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}`;
}

export function resolveOrgPositions(userEmail: UserEmail, orgSlug: string) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos`;
}

export function resolveOrgStates(userEmail: string, orgSlug: string) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:states`;
}

export function resolvePos(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}`;
}

export function resolvePosBenchmark(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string,
  benchmark: z.infer<typeof queriedBenchmark>
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}:${benchmark.toLocaleLowerCase()}`;
}

export function resolvePosAchievement(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string,
  achievementSlug: string
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}:ach:${achievementSlug.toLocaleLowerCase()}`;
}

export function resolvePosChallenge(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string,
  challengeSlug: string
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}:cha:${challengeSlug.toLocaleLowerCase()}`;
}

export function resolvePosFailure(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string,
  failureSlug: string
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}:fai:${failureSlug.toLocaleLowerCase()}`;
}

export function resolvePosProject(
  userEmail: UserEmail,
  orgSlug: string,
  positionSlug: string,
  projectSlug: string
) {
  return `user:${userEmail.toLocaleLowerCase()}:org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}:pro:${projectSlug.toLocaleLowerCase()}`;
}

export function resolveProvidedKeys() {
  return {
    organizations: {
      all: "provided:orgs:all",
      current: "provided:orgs:current",
    },
    positions: {
      all: "provided:positions:all",
      current: "provided:positions:current",
    },
    benchmark: {
      parentOrganization: "provided:benchmark:parent:org",
      parentPosition: "provided:benchmark:parent:position",
      kind: "provided:benchmark:parent:kind",
    },
    form: {
      benchmark: "provided:form:benchmark",
    },
  };
}
