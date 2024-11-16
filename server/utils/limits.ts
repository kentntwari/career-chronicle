import type { Orgs, OrgPos } from "~/types";
import type { Position } from "@prisma/client";

import { H3Event } from "h3";
import { Tier } from "@prisma/client";
import { UserType } from "@kinde-oss/kinde-typescript-sdk";

import { redis } from "~/lib/redis";
import * as store from "~/utils/store";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;

interface NarrowedTargets {
  targetOrganization: Orgs[number]["slug"] | null;
  // targetPosition: Position["slug"] | null;
}

export async function enforcePlanLimits<
  T extends typeof ORGANIZATION | typeof POSITION,
  K extends NarrowedTargets,
>(
  event: H3Event,
  user: UserType,
  target: T,
  { targetOrganization = null } = {} as K
) {
  let cachedOrgs: Orgs[number][];
  let cachedPositions: Position[];

  const userPlan = await event.$fetch("/api/user/plan");

  if (!userPlan)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
      message: "User plan not found",
    });

  switch (true) {
    case target === "organization" && !targetOrganization:
      cachedOrgs = await retrieveCachedOrgs(user);
      await capOrgs(event, userPlan.tier, cachedOrgs);
      break;

    case target === "position" && !targetOrganization:
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Organization not provided",
      });

    case target === "position" && !!targetOrganization:
      cachedPositions = await retrieveCachedPositions(user, targetOrganization);
      await capPositions(event, userPlan.tier, cachedPositions);
      break;

    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
      });
  }
}

async function retrieveCachedOrgs(user: UserType) {
  // TODO: extend unstorage with redis to unify cache method
  return await redis.lrange<Orgs[number]>(
    store.resolveUserOrgs(user.email),
    0,
    -1
  );
}

async function retrieveCachedPositions(
  user: UserType,
  org: NonNullable<NarrowedTargets["targetOrganization"]>
) {
  // TODO: extend unstorage with redis to unify cache method
  return await redis.lrange<Position>(
    store.resolveOrgPositions(user.email, org),
    0,
    -1
  );
}

async function capOrgs(event: H3Event, userPlan: Tier, initialOrgs: Orgs) {
  switch (true) {
    case initialOrgs.length > 4 && userPlan === "FREE":
      throw createError({
        statusCode: 400,
        statusMessage: "You have reached the maximum number of organizations",
      });

    default:
      const dbOrgs = await event.$fetch("/api/organizations");
      if (dbOrgs!.length > 4 && userPlan === "FREE")
        throw createError({
          statusCode: 400,
          statusMessage: "You have reached the maximum number of organizations",
        });
      break;
  }
}

async function capPositions(
  event: H3Event,
  userPlan: Tier,
  initialPositions: Position[]
) {
  switch (true) {
    case initialPositions.length > 10 && userPlan === "FREE":
      throw createError({
        statusCode: 400,
        statusMessage: "You have reached the maximum number of positions",
      });

    default:
      const parentOrganization = getRouterParam(event, "orgSlug");

      if (!parentOrganization)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Organization not provided",
        });

      const dbPositions = await event.$fetch<OrgPos>(
        "/api/organization/" + parentOrganization + "/positions"
      );

      if (dbPositions.length > 10 && userPlan === "FREE")
        throw createError({
          statusCode: 400,
          statusMessage: "You have reached the maximum number of organizations",
        });
      break;
  }
}
