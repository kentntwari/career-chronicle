import type { Tier } from "@prisma/client";

import { z } from "zod";

import { userCredentialsSchema } from "./zschemas";

export const DATA_STORE = "data";

type UserEmail = z.infer<typeof userCredentialsSchema>["email"];

export function resolveUser(email: UserEmail) {
  return `user:${email}:first-time`;
}

export function resolveUserOrgs(email: UserEmail) {
  return `user:${email}:orgs`;
}

export function resolveUserPlan(email: UserEmail) {
  return `user:${email}:plan`;
}

export function resolvePlanLimits(plan: Tier) {
  return `plan:${plan}:limits`;
}

export function resolveOrg(userEmail: UserEmail, orgSlug: string) {
  return `user:${userEmail}org:${orgSlug}`;
}

export function resolveOrgPositions(userEmail: UserEmail, orgSlug: string) {
  return `user:${userEmail}:org:${orgSlug}:pos`;
}

export function resolveOrgStates(userEmail: string, orgSlug: string) {
  return `user:${userEmail}:org:${orgSlug}:states`;
}

export function resolvePos(userEmail: UserEmail, orgSlug: string, pos: string) {
  return `user:${userEmail}:org:${orgSlug}:pos:${pos}`;
}
