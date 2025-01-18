import type { Month } from "@prisma/client";
import type { SingleOrg, OrgPos, SinglePos } from "~/types";

import { redis } from "~/lib/redis";
import * as store from "~/utils/keys";
import * as authorize from "@/server/utils/authorize";
import { validateParams } from "~/server/utils/params";
import { enforcePlanLimits } from "~/server/utils/limits";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:position"
    );

    const parentOrganization = validateParams(event, "organization");

    const user = await kinde.getUser();

    await enforcePlanLimits(event, user, "position", {
      targetOrganization: parentOrganization,
    });

    const submitted = await validateSubmission(event, "position");
    const coerced = {
      ...submitted,
      title: submitted.title.toLocaleLowerCase(),
      slug: submitted.slug.toLocaleLowerCase(),
      description: submitted.description?.toLocaleLowerCase() ?? undefined,
      timeline: {
        ...submitted.timeline,
        month: submitted.timeline.month.toLocaleUpperCase() as Month,
      },
    } satisfies typeof submitted;

    const cachedOrganization = (await redis.hgetall<SingleOrg>(
      store.resolveUserOrg(user.email, parentOrganization)
    )) as NonNullable<SingleOrg>;

    // TODO: extend unstorage with redis to unify cache method
    await Promise.all([
      // 1
      redis.rpush<OrgPos[number]>(
        store.resolveUserOrgPositions(user.email, parentOrganization),
        {
          ...coerced,
          monthStartedAt: coerced.timeline.month,
          yearStartedAt: coerced.timeline.year,
        }
      ),
      // 2
      cachedOrganization.hasCreatedPositionBefore
        ? {}
        : redis.hset(store.resolveUserOrg(user.email, parentOrganization), {
            ...cachedOrganization,
            hasCreatedPositionBefore: true,
          } ),
      // 3
      redis.hset(
        store.resolveUserPos(user.email, parentOrganization, coerced.slug),
        {
          title: coerced.title,
          slug: coerced.slug,
          description: coerced.description ?? null,
          monthStartedAt: coerced.timeline.month,
          yearStartedAt: coerced.timeline.year,
        } satisfies SinglePos
      ),
      // 4
      createOrgPosition(parentOrganization, coerced),
    ]);
    return null;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
