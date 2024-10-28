import type { Orgs } from "~/types";

import { H3Error } from "h3";

import { loadUserOrgs } from "~/server/utils/db";
import * as authorize from "~/server/utils/authorize";
import * as store from "@/utils/store";
import { redis } from "@/lib/redis";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(permissions as authorize.Permissions, "read:orgs");

    const storage = useStorage("data");
    const user = await kinde.getUser();
    const isFirstTimeUser = await storage.getItem(
      store.resolveUser(user.email)
    );

    if (!isFirstTimeUser) {
      // TODO: extend useStorage with more redis methods to unify caching methods
      const cachedOrgs = await redis.lrange<Orgs[number]>(
        store.resolveUserOrgs(user.email),
        0,
        -1
      );

      switch (true) {
        case cachedOrgs.length > 0:
          return cachedOrgs;

        default:
          const userOrgs = await loadUserOrgs({
            id: user.id,
            email: user.email,
          });

          if (!userOrgs) return [];

          for (const org of userOrgs)
            await redis.rpush(store.resolveUserOrgs(user.email), org);
      }
    }

    return [];
  } catch (error) {
    if (error instanceof H3Error) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
