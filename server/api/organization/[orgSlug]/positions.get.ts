import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { OrgPos } from "~/types";

import * as authorize from "@/server/utils/authorize";
import * as store from "~/utils/keys";
import { queryByMonthOrYear } from "~/utils/zschemas";
import * as db from "~/server/utils/db";
import { z } from "zod";
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

    const organization = validateParams(
      event,
      "organization"
    ).toLocaleLowerCase();
    const query = getQuery(event);
    const parsedQuery = queryByMonthOrYear.safeParse(query);

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
      case cachedPositions.length > 0: {
        if (!parsedQuery.success) return cachedPositions;
        return filterPositionsByQueryParams(cachedPositions, parsedQuery.data);
      }

      default:
        const dbOrg = await db.loadOrgPositions(organization);
        if (!dbOrg) return [];
        cacheOrgPositions(user.email, organization, dbOrg.positions);
        if (!parsedQuery.success) return dbOrg.positions;
        return filterPositionsByQueryParams(dbOrg.positions, parsedQuery.data);
    }
  } catch (error) {
    console.log(error);
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

function filterPositionsByQueryParams(
  positions: OrgPos,
  queryParams: z.infer<typeof queryByMonthOrYear>
) {
  const { month, year } = queryParams;

  if (!month && !year) return positions;
  if (!!month && !!year)
    return positions.filter(
      (pos) => pos.monthStartedAt === month && pos.yearStartedAt === year
    );
  if (!!month) return positions.filter((pos) => pos.monthStartedAt === month);
  if (!!year) return positions.filter((pos) => pos.yearStartedAt === year);

  return positions;
}
