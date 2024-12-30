import type { SingleOrg } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserOrg } from "~/utils/keys";
import { loadOrg } from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(permissions as authorize.Permissions, "read:orgs");

    const organization = validateParams(
      event,
      "organization"
    ).toLocaleLowerCase();

    const user = await kinde.getUser();

    // FIX: cached positions and database must match.
    // TODO: currently, there's no way to predict in advance
    //what will be dropped from redis cache
    const cachedOrgs = await redis.hgetall<SingleOrg>(
      resolveUserOrg(user.email, organization)
    );

    if (cachedOrgs) return cachedOrgs;

    const dbOrg = await loadOrg(organization);

    if (!dbOrg)
      throw createError({
        statusCode: 404,
        statusMessage: "Not found",
      });

    await redis.hset(resolveUserOrg(user.email, organization), dbOrg);

    return dbOrg;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
