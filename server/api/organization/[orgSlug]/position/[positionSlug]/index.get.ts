import type { SinglePos } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { resolveUserPos } from "~/utils/keys";
import { loadPosition } from "~/server/utils/db";
import { validateParams } from "~/server/utils/params";
import { errorMessages } from "~/server/utils/errors";

export default defineEventHandler(async (event) => {
  const { kinde } = await allowAuthorizedKindeUser(event);
  const { permissions } = await kinde.getPermissions();
  authorize.hasPermissions(
    permissions as authorize.Permissions,
    "read:position"
  );

  const user = await kinde.getUser();

  const organization = validateParams(event, "organization");
  const position = validateParams(event, "position");

  // FIX: cached positions and database must match.
  // TODO: currently, there's no way to predict in advance
  //what will be dropped from redis cache
  const cachedPositions = await redis.hgetall<SinglePos>(
    resolveUserPos(user.email, organization, position)
  );

  if (cachedPositions) return cachedPositions;

  const dbPosition = await loadPosition(organization, position);

  if (!dbPosition)
    throw createError({
      statusCode: 404,
      statusMessage: errorMessages.POSITION_NOT_FOUND,
    });

  await redis.hset(
    resolveUserPos(user.email, organization, position),
    dbPosition
  );

  return dbPosition;
});
