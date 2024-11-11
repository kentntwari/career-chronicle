import { H3Error } from "h3";
import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { Plan } from "@prisma/client";
import * as authorize from "@/server/utils/authorize";
import * as store from "~/utils/store";
import { createFreePlan } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(permissions as authorize.Permissions, "read:orgs");

    const user = await kinde.getUser();

    const userPlan = await useStorage(store.DATA_STORE).getItem<Plan>(
      store.resolveUserPlan(user.email)
    );

    if (userPlan) return userPlan;

    const dbPlan = await findUserPlan({ id: user.id, email: user.email });

    if (!dbPlan) {
      const freePlan = await createFreePlan({
        id: user.id,
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
      });

      cacheUserPlan(freePlan as Plan, user.email);

      return freePlan;
    }

    cacheUserPlan(dbPlan?.plan as Plan, user.email);

    return dbPlan?.plan;
  } catch (error) {
    throwError(error);
  }
});

function cacheUserPlan(plan: Plan, userEmail: UserType["email"]) {
  return useStorage(store.DATA_STORE).setItem<Plan>(
    store.resolveUserPlan(userEmail),
    plan
  );
}
