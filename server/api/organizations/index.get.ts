import type { Orgs } from "~/types";

import * as authorize from "~/server/utils/authorize";
import * as store from "~/utils/keys";
import { redis } from "@/lib/redis";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(permissions as authorize.Permissions, "read:orgs");

    const storage = useStorage("data");
    const user = await kinde.getUser();

    const isFirstTimeUser = await storage.getItem(
      store.resolveFirstTimerUser(user.email)
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

          return userOrgs;
      }
    }

    return [];
  } catch (error) {
    throwError(error);
  }
});
