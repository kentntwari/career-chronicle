import type { Orgs } from "~/types";

import { redis } from "@/lib/redis";
import * as authorize from "@/server/utils/authorize";
import { validateSubmission } from "@/server/utils/submissions";
import { enforcePlanLimits } from "~/server/utils/limits";
import * as k from "~/utils/keys";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:orgs"
    );

    const user = await kinde.getUser();
    const isFirstTimeUser = await redis.get<boolean>(
      k.resolveFirstTimerUser(user.email)
    );
    if (isFirstTimeUser)
      await redis.set(k.resolveFirstTimerUser(user.email), false);

    // FIX: cached organizations and database must match.
    await enforcePlanLimits(event, user, "organization");
    const submitted = await validateSubmission(event, "organization");
    await Promise.all([
      redis.rpush<Orgs[number]>(k.resolveUserOrgs(user.email), {
        name: submitted.name.toLocaleLowerCase(),
        slug: submitted.slug,
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
