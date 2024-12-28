import type { OrgPos } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveOrgPositions } from "~/utils/keys";
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

    const orgSlug = validateParams(event, "organization").toLocaleLowerCase();
    const positionSlug = validateParams(event, "position").toLocaleLowerCase();

    const keys = await redis.keys(
      `*org:${orgSlug.toLocaleLowerCase()}:pos:${positionSlug.toLocaleLowerCase()}*`
    );

    const cachedPositions = await redis.lrange<OrgPos[number]>(
      resolveOrgPositions(user.email, orgSlug),
      0,
      -1
    );
    const position: OrgPos[number] = cachedPositions.find(
      (pos) => pos.slug === positionSlug
    ) ?? {
      title: "",
      slug: positionSlug,
      monthStartedAt: "JANUARY",
      yearStartedAt: 1950,
    };

    const p = redis.pipeline();
    if (keys.length) p.del(...keys);
    p.lrem<OrgPos[number]>(resolveOrgPositions(user.email, orgSlug), 0, {
      ...position,
    });

    await Promise.all([p.exec(), , deleteDbPosition(orgSlug, positionSlug)]);

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
