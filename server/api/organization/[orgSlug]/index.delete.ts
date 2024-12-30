import type { Orgs } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserOrgs } from "~/utils/keys";
import { deleteOrg as deleteDbOrg } from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:orgs"
    );

    const user = await kinde.getUser();

    const orgSlug = validateParams(event, "organization").toLocaleLowerCase();

    const keys = await redis.keys(`*${orgSlug}*`);

    const cachedOrgs = await redis.lrange<Orgs[number]>(
      resolveUserOrgs(user.email),
      0,
      -1
    );
    const orgName = cachedOrgs.find((org) => org.slug === orgSlug)?.name ?? "";

    const p = redis.pipeline();
    if (keys.length) p.del(...keys);
    p.lrem<Orgs[number]>(resolveUserOrgs(user.email), 0, {
      name: orgName,
      slug: orgSlug,
    });

    await Promise.all([p.exec(), , deleteDbOrg(orgSlug)]);

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
