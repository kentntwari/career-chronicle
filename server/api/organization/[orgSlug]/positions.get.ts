import type { H3Event } from "h3";
import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { OrgPos } from "~/types";

import * as authorize from "@/server/utils/authorize";
import * as store from "~/utils/store";
import * as db from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";
import redis from "~/lib/redis";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "read:position"
    );

    const organization = validateParams(event, "organization");

    const user = await kinde.getUser();

    // FIX: cached positions and database must match.
    // TODO: currently, there's no way to predict in advance
    //what will be dropped from redis cache
    const cachedPositions = await redis.lrange<OrgPos[number]>(
      store.resolveOrgPositions(user.email, organization),
      0,
      -1
    );

    switch (true) {
      case cachedPositions.length > 0:
        return cachedPositions;

      default:
        const dbOrg = await db.loadOrgPositions(organization);
        if (!dbOrg) return [];
        cacheOrgPositions(user.email, organization, dbOrg.positions);
        return dbOrg.positions;
    }
  } catch (error) {
    throwError(error);
  }
});

async function cacheOrgPositions(
  userEmail: UserType["email"],
  org: string,
  positions: OrgPos
) {
  for (const pos of positions) {
    await redis.rpush(store.resolveOrgPositions(userEmail, org), pos);
  }
}
