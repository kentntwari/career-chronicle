import type { Month } from "@prisma/client";
import type { OrgPos, SinglePos } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserOrgPositions, resolveUserPos } from "~/utils/keys";
import {
  loadPosition as loadDbPosition,
  patchOrgPosition as patchDbPosition,
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
    const positionSlug = validateParams(event, "position").toLocaleLowerCase();
    const submitted = await validateSubmission(event, "position", "PATCH");

    if (!submitted.position) return;

    let redis_keys: string[];
    let redis_arr: OrgPos;
    let redis_arr_resource: OrgPos[number] | null | undefined;
    let redis_hash: SinglePos | null;
    let db_resource:
      | Awaited<ReturnType<typeof loadDbPosition>>
      | null
      | undefined;

    redis_keys = await redis.keys(
      `*${resolveUserPos(user.email, orgSlug, positionSlug)}*`
    );

    redis_hash = await redis.hgetall<SinglePos>(
      resolveUserPos(user.email, orgSlug, positionSlug)
    );
    redis_arr = await redis.lrange(
      resolveUserOrgPositions(user.email, orgSlug),
      0,
      -1
    );
    redis_arr_resource = redis_arr.find((pos) => pos.slug === positionSlug);

    if (!redis_arr_resource && !redis_hash)
      db_resource = await loadDbPosition(orgSlug, positionSlug);

    if (!redis_arr_resource && !redis_hash && !db_resource) return;

    const p = redis.pipeline();

    if (redis_keys.length > 0) p.del(...redis_keys);
    if (redis_arr_resource)
      p.lrem(
        resolveUserOrgPositions(user.email, orgSlug),
        0,
        redis_arr_resource
      );

    p.rpush<OrgPos[number]>(resolveUserOrgPositions(user.email, orgSlug), {
      title:
        submitted.position.title ??
        redis_arr_resource?.title ??
        redis_hash?.title ??
        db_resource?.title ??
        "",
      slug: submitted.slug.new,
      monthStartedAt:
        (submitted.position.timeline?.month?.toUpperCase() as Month) ??
        redis_arr_resource?.monthStartedAt ??
        redis_hash?.monthStartedAt ??
        db_resource?.monthStartedAt ??
        "",
      yearStartedAt:
        submitted.position.timeline?.year ??
        redis_arr_resource?.yearStartedAt ??
        redis_hash?.yearStartedAt ??
        db_resource?.yearStartedAt ??
        0,
    });

    switch (true) {
      case !!submitted.position.title:
        await Promise.all([
          p.exec(),
          patchDbPosition(orgSlug, positionSlug, {
            title: submitted.position.title,
            slug: submitted.slug.new,
          }),
        ]);
        break;

      case !!submitted.position.description:
        await Promise.all([
          p.exec(),
          patchDbPosition(orgSlug, positionSlug, {
            description: submitted.position.description,
          }),
        ]);
        break;

      case !!submitted.position.timeline:
        const timeline = submitted.position.timeline;

        if (!timeline) return;

        if (!timeline.month)
          throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Missing month",
          });

        if (!timeline.year)
          throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Missing year",
          });

        await Promise.all([
          p.exec(),
          patchDbPosition(orgSlug, positionSlug, {
            monthStartedAt: timeline.month.toLocaleUpperCase() as Month,
            yearStartedAt: timeline.year,
          }),
        ]);
        break;

      default:
        throw createError({
          statusCode: 404,
          statusMessage: "Invalid Request",
        });
    }

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
