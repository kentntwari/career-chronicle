import type { KindeAccessToken } from "~/types";

import { redis } from "@/lib/redis";
import * as store from "~/utils/keys";
import { checkExistingDbUser } from "~/server/utils/db";

// TODO: Might have to set httOnly to true
// for now it's fine since it's just for client side purposes
const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  secure: true,
  // httpOnly: true,
  sameSite: "strict",
} as const;

const COOKIE_NAME = "isFirstTime";

export default defineEventHandler(async (event) => {
  try {
    const n = useNitroApp();

    const { kinde } = await allowAuthorizedKindeUser(event);
    const user = await kinde.getUser();

    const isFirstTimeUser = await redis.get<boolean>(
      store.resolveFirstTimerUser(user.email)
    );

    if (isFirstTimeUser === null) {
      const isExistingUser = await checkExistingDbUser({
        id: user.id,
        email: user.email,
      });

      switch (true) {
        case isExistingUser:
          await redis.set<boolean>(
            store.resolveFirstTimerUser(user.email),
            false
          );
          setCookie(event, COOKIE_NAME, "false", COOKIE_OPTIONS);
          return null;

        default:
          await redis.set<boolean>(
            store.resolveFirstTimerUser(user.email),
            true
          );
          setCookie(event, COOKIE_NAME, "true", COOKIE_OPTIONS);
          return null;
      }
    }
    setCookie(event, COOKIE_NAME, isFirstTimeUser.toString(), COOKIE_OPTIONS);
    return null;
  } catch (error) {
    throwError(error);
  }
});
