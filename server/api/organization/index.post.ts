import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { Orgs } from "~/types";

import { redis } from "@/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { validateSubmission } from "@/server/utils/submissions";
import { enforcePlanLimits } from "~/server/utils/limits";
import * as store from "~/utils/keys";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:orgs"
    );

    const user = await kinde.getUser();
    const storage = useStorage(store.DATA_STORE);
    const isFirstTimeUser = await storage.getItem<boolean>(
      store.resolveUser(user.email)
    );
    if (isFirstTimeUser)
      await storage.setItem(store.resolveUser(user.email), false);

    // FIX: cached organizations and database must match.
    await enforcePlanLimits(event, user, "organization");

    const submitted = await validateSubmission(event, "organization");

    await Promise.all([
      // TODO: extend unstorage with redis to unify cache method
      redis.rpush<Orgs[number]>(store.resolveUserOrgs(user.email), {
        name: submitted.name.toLocaleLowerCase(),
        slug: submitted.slug.toLocaleLowerCase(),
      }),
      // write to the database
      createNewOrg(
        {
          id: user.id,
          firstName: user.given_name,
          lastName: user.family_name,
          email: user.email,
        },
        submitted.name.toLocaleLowerCase(),
        submitted.slug.toLocaleLowerCase()
      ),
    ]);
    return null;
  } catch (error) {
    throwError(error);
  }
});
