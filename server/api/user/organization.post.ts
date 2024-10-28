import { H3Error, H3Event } from "h3";
import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { Orgs, UserPlan } from "~/types";

import { redis } from "@/lib/redis";
import * as authorize from "@/server/utils/authorize";
import * as zschemas from "~/utils/zschemas";
import * as store from "~/utils/store";
import { createNewOrg, findUserPlan } from "~/server/utils/db";

const KV_STORE = "data";
const DEFAULT_USER_PLAN: UserPlan = "FREE";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:orgs"
    );

    const submitted = await validateSubmission(event);

    const user = await kinde.getUser();

    const storage = useStorage(KV_STORE);
    const isFirstTimeUser = await storage.getItem<boolean>(
      store.resolveUser(user.email)
    );

    if (isFirstTimeUser)
      await storage.setItem(store.resolveUser(user.email), false);

    const userPlan = await storage.getItem<UserPlan>(
      store.resolveUserPlan(user.email)
    );

    if (!userPlan) {
      const dbPlan = await findUserPlan({ id: user.id, email: user.email });
      const assignedPlan = dbPlan?.plan?.tier || DEFAULT_USER_PLAN;
      await storage.setItem(store.resolveUserPlan(user.email), assignedPlan);
      await preventExceedMaxOrgs(event, user, assignedPlan);
    } else await preventExceedMaxOrgs(event, user, userPlan);

    cacheAndDbWrite(submitted.data, user);

    return null;
  } catch (error) {
    if (error instanceof H3Error)
      throw createError({
        ...error,
      });

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});

async function validateSubmission(event: H3Event) {
  const submitted = await readValidatedBody(event, (body) =>
    zschemas.incomingNewOrgBody.safeParse(body)
  );

  if (!submitted.success)
    throw createError({
      statusCode: 400,
      statusMessage: "Wrong submission",
    });

  return submitted;
}

async function preventExceedMaxOrgs(
  event: H3Event,
  user: UserType,
  userPlan: UserPlan
) {
  // TODO: extend unstorage with redis to unify cache method
  const currentCachedOrgs = await redis.lrange<Orgs[number]>(
    store.resolveUserOrgs(user.email),
    0,
    -1
  );

  if (currentCachedOrgs.length > 4 && userPlan === "FREE") {
    throw createError({
      statusCode: 400,
      statusMessage: "You have reached the maximum number of organizations",
    });
  }

  if (currentCachedOrgs.length === 0) preventExceedDBOrgs(event, userPlan);
}

async function preventExceedDBOrgs(event: H3Event, userPlan: UserPlan) {
  const dbOrgs = await event.$fetch("/api/user/organizations");
  if (dbOrgs.length > 4 && userPlan === "FREE")
    throw createError({
      statusCode: 400,
      statusMessage: "You have reached the maximum number of organizations",
    });
}

async function cacheAndDbWrite(data: Orgs[number], user: UserType) {
  await Promise.all([
    // TODO: extend unstorage with redis to unify cache method
    redis.rpush<Orgs[number]>(store.resolveUserOrgs(user.email), {
      ...data,
    }),
    // write to the database
    createNewOrg(
      {
        id: user.id,
        firstName: user.given_name,
        lastName: user.family_name,
        email: user.email,
      },
      data.name,
      data.slug
    ),
  ]);
}
