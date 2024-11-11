import { H3Event } from "h3";

import type { SingleOrg } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { enforcePlanLimits } from "~/server/utils/limits";
import { validateOrganization } from "../index.get";

export default defineEventHandler(async (event) => {
  const { kinde } = await allowAuthorizedKindeUser(event);
  const { permissions } = await kinde.getPermissions();
  authorize.hasPermissions(
    permissions as authorize.Permissions,
    "update:position"
  );

  const parentOrganization = validateOrganization(event);
  const position = validatePosition(event);

  const user = await kinde.getUser();

  await enforcePlanLimits(event, user, "position", {
    targetOrganization: parentOrganization,
    targetPosition: position,
  });
});

export function validatePosition(event: H3Event) {
  const position = getRouterParam(event, "position");

  if (!position)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad request",
      message: "Position not provided",
    });

  return position;
}
