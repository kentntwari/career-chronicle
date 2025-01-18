import type { Orgs } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserOrgs } from "~/utils/keys";
import {
  loadOrg as loadDbOrg,
  patchOrg as patchDbOrg,
} from "~/server/utils/db";
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
    const submitted = await validateSubmission(event, "organization", "PATCH");

    let redis_keys: string[];
    let redis_arr: Orgs;
    let redis_arr_resource: Orgs[number] | null | undefined;
    let db_resource: Awaited<ReturnType<typeof loadDbOrg>> | null | undefined;

    redis_keys = await redis.keys(`*user:${user.email}:org:${orgSlug}*`);
    redis_arr = await redis.lrange(resolveUserOrgs(user.email), 0, -1);
    redis_arr_resource = redis_arr.find((org) => org.slug === orgSlug);

    if (!redis_arr_resource) db_resource = await loadDbOrg(orgSlug);
    if (!redis_arr_resource && !db_resource) return;

    if (!submitted.org?.name) return;
    if (submitted.org.name === redis_arr_resource?.name) return;
    if (submitted.org.name === db_resource?.name) return;

    let updatedResource: Orgs[number] = {
      name:
        submitted.org?.name ??
        redis_arr_resource?.name ??
        db_resource?.name ??
        "",
      slug: submitted.slug.new,
    };
    const p = redis.pipeline();

    if (redis_keys.length > 0) p.del(...redis_keys);

    if (redis_arr_resource)
      p.lrem(resolveUserOrgs(user.email), 0, redis_arr_resource);

    if (submitted.org?.name)
      p.rpush(resolveUserOrgs(user.email), updatedResource);

    await Promise.all([p.exec(), patchDbOrg(orgSlug, updatedResource)]);

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
