import type { OrgPos } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserPos, resolveUserOrgPositions } from "~/utils/keys";
import { deletePosition as deleteDbPosition } from "~/server/utils/db";
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

    const orgSlug = validateParams(event, "organization");
    const positionSlug = validateParams(event, "position");

    const keys = await redis.keys(
      `*${resolveUserPos(user.email, orgSlug, positionSlug)}*`
    );

    const cachedPositions = await redis.lrange<OrgPos[number]>(
      resolveUserOrgPositions(user.email, orgSlug),
      0,
      -1
    );
    const position = cachedPositions.find((pos) => pos.slug === positionSlug);

    const p = redis.pipeline();
    if (keys.length) p.del(...keys);
    if (position)
      p.lrem<OrgPos[number]>(resolveUserOrgPositions(user.email, orgSlug), 0, {
        ...position,
      });

    await Promise.all([p.exec(), deleteDbPosition(orgSlug, positionSlug)]);

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
