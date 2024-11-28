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

    const parentOrganization = validateParams(
      event,
      "organization"
    ).toLocaleLowerCase();

    const user = await kinde.getUser();

    await enforcePlanLimits(event, user, "position", {
      targetOrganization: parentOrganization,
    });

    const submitted = await validateSubmission(event, "position");

    // Cannot be null because it must traverse the parent organization and
    // set it before it reaches this point
    const cachedOrganization = (await redis.hgetall<SingleOrg>(
      store.resolveOrg(user.email, parentOrganization)
    )) as NonNullable<SingleOrg>;

    // TODO: extend unstorage with redis to unify cache method
    await Promise.all([
      // 1
      redis.rpush<OrgPos[number]>(
        store.resolveOrgPositions(user.email, parentOrganization),
        {
          title: submitted.title.toLocaleLowerCase(),
          slug: submitted.slug.toLocaleLowerCase(),
          monthStartedAt: submitted.timeline.month.toUpperCase() as Month,
          yearStartedAt: submitted.timeline.year,
        }
      ),
      // 2
      cachedOrganization.hasCreatedPositionBefore
        ? {}
        : redis.hset(store.resolveOrg(user.email, parentOrganization), {
            ...cachedOrganization,
            hasCreatedPositionBefore: true,
          }),
      // 3
      redis.hset(
        store.resolvePos(user.email, parentOrganization, submitted.slug),
        {
          title: submitted.title.toLocaleLowerCase(),
          slug: submitted.slug.toLocaleLowerCase(),
          description: submitted.description?.toLocaleLowerCase() ?? null,
          monthStartedAt: submitted.timeline.month.toUpperCase() as Month,
          yearStartedAt: submitted.timeline.year,
        }
      ),
      // 4
      createOrgPosition(parentOrganization, submitted),
    ]);
    return null;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
