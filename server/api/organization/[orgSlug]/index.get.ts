import { H3Event } from "h3";

import type { SingleOrg } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveOrg } from "~/utils/store";
import { loadOrg } from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";

export default defineEventHandler(async (event) => {
  const { kinde } = await allowAuthorizedKindeUser(event);
  const { permissions } = await kinde.getPermissions();
  authorize.hasPermissions(permissions as authorize.Permissions, "read:orgs");

  const organization = validateParams(event, "organization");

  const user = await kinde.getUser();

  // FIX: cached positions and database must match.
  // TODO: currently, there's no way to predict in advance
  //what will be dropped from redis cache
  const cachedOrgs = await redis.hgetall<SingleOrg>(
    resolveOrg(user.email, organization)
  );

  if (cachedOrgs) return cachedOrgs;

  const dbOrg = await loadOrg(organization);

  if (!dbOrg)
    throw createError({
      statusCode: 404,
      statusMessage: "Not found",
    });

  await redis.hset(resolveOrg(user.email, organization), dbOrg);

  return dbOrg;
});
