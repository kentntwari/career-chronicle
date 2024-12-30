import type { Orgs, OrgPos, Benchmarks } from "~/types";

import { H3Event } from "h3";
import { z } from "zod";
import { Tier } from "@prisma/client";
import { UserType } from "@kinde-oss/kinde-typescript-sdk";

import { redis } from "~/lib/redis";
import * as k from "~/utils/keys";
import * as benchmarks from "~/constants/benchmarks";
import { queriedBenchmark } from "~/utils/zschemas";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;

interface NarrowedTargets {
  targetOrganization: Orgs[number]["slug"] | null;
  targetPosition?: OrgPos[number]["slug"] | null;
}

export async function enforcePlanLimits<
  T extends
    | typeof ORGANIZATION
    | typeof POSITION
    | (typeof benchmarks)[keyof typeof benchmarks],
  K extends NarrowedTargets,
>(
  event: H3Event,
  user: UserType,
  target: T,
  { targetOrganization = null, targetPosition = null } = {} as K
) {
  // TODO: refactor to cater for issues with cache. will have to read from db
  let cachedOrgs: Orgs;
  let cachedPositions: OrgPos;
  let cachedBenchmarks: Benchmarks[number][];

  const userPlan = await event.$fetch("/api/user/plan");

  if (!userPlan)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
      message: "User plan not found",
    });

  switch (true) {
    case target === ORGANIZATION && !!targetPosition:
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Not allowed",
      });

    case target === POSITION && !targetOrganization:
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Organization not provided",
      });

    case target === ORGANIZATION && !targetOrganization && !targetPosition:
      cachedOrgs = await retrieveCachedOrgs(user.email);
      await capOrgs(event, userPlan.tier, cachedOrgs);
      break;

    case target === POSITION && !!targetOrganization && !targetPosition:
      cachedPositions = await retrieveCachedPositions(
        user.email,
        targetOrganization
      );
      await capPositions(event, userPlan.tier, cachedPositions);
      break;

    case !!targetOrganization && !!targetPosition:
      if (target !== ORGANIZATION && target !== POSITION) {
        cachedBenchmarks = await retrieveCachedBenchmarks(
          user.email,
          targetOrganization,
          targetPosition,
          benchmarks[target as keyof typeof benchmarks] as z.infer<
            typeof queriedBenchmark
          >
        );

        return await capBenchmarks(
          event,
          userPlan.tier,
          benchmarks[target as keyof typeof benchmarks] as z.infer<
            typeof queriedBenchmark
          >,
          cachedBenchmarks
        );
      }

    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
      });
  }
}

async function retrieveCachedOrgs(userEmail: UserType["email"]) {
  // TODO: extend unstorage with redis to unify cache method
  return await redis.lrange<Orgs[number]>(k.resolveUserOrgs(userEmail), 0, -1);
}

async function retrieveCachedPositions(
  userEmail: UserType["email"],
  org: NonNullable<NarrowedTargets["targetOrganization"]>
) {
  // TODO: extend unstorage with redis to unify cache method
  return await redis.lrange<OrgPos[number]>(
    k.resolveUserOrgPositions(userEmail, org),
    0,
    -1
  );
}

async function retrieveCachedBenchmarks(
  userEmail: UserType["email"],
  org: NonNullable<NarrowedTargets["targetOrganization"]>,
  position: NonNullable<NarrowedTargets["targetPosition"]>,
  benchmark: z.infer<typeof queriedBenchmark>
) {
  // TODO: extend unstorage with redis to unify cache method
  return await redis.lrange<Benchmarks[number]>(
    k.resolveUserPosBenchmark(userEmail, org, position, benchmark),
    0,
    -1
  );
}

async function capOrgs(event: H3Event, userPlan: Tier, initialOrgs: Orgs) {
  const ERROR_MESSAGE = "You have reached the maximum number of organizations";

  switch (true) {
    case initialOrgs.length > 4 && userPlan === "FREE":
      throw createError({
        statusCode: 400,
        statusMessage: ERROR_MESSAGE,
      });

    default:
      const dbOrgs = await event.$fetch("/api/organizations");
      if (dbOrgs!.length > 4 && userPlan === "FREE")
        throw createError({
          statusCode: 400,
          statusMessage: ERROR_MESSAGE,
        });
      break;
  }
}

async function capPositions(
  event: H3Event,
  userPlan: Tier,
  initialPositions: OrgPos
) {
  const ERROR_MESSAGE = "You have reached the maximum number of positions";

  switch (true) {
    case initialPositions.length > 10 && userPlan === "FREE":
      throw createError({
        statusCode: 400,
        statusMessage: ERROR_MESSAGE,
      });

    default:
      const parentOrganization = validateParams(
        event,
        "organization"
      ).toLocaleLowerCase();

      const dbPositions = await event.$fetch<OrgPos>(
        "/api/organization/" + parentOrganization + "/positions"
      );

      if (dbPositions.length > 10 && userPlan === "FREE")
        throw createError({
          statusCode: 400,
          statusMessage: ERROR_MESSAGE,
        });
      break;
  }
}

async function capBenchmarks(
  event: H3Event,
  userPlan: Tier,
  benchmark: z.infer<typeof queriedBenchmark>,
  initialData: Benchmarks[number][]
) {
  const ERROR_MESSAGE =
    "You have reached the maximum number of" + benchmark.toLocaleLowerCase();

  switch (true) {
    case initialData.length > 20 && userPlan === "FREE":
      throw createError({
        statusCode: 400,
        statusMessage: ERROR_MESSAGE,
      });

    default:
      const parentOrganization = validateParams(
        event,
        "organization"
      ).toLocaleLowerCase();
      const parentPosition = validateParams(
        event,
        "position"
      ).toLocaleLowerCase();

      const dbBenchmarks = await event.$fetch<Benchmarks>(
        `/api/organization/${parentOrganization}/position/${parentPosition}/benchmarks`,
        {
          query: {
            benchmark,
          },
        }
      );

      if (dbBenchmarks.length > 20 && userPlan === "FREE")
        throw createError({
          statusCode: 400,
          statusMessage: ERROR_MESSAGE,
        });
      break;
  }
}
